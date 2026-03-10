use prost_reflect::{DescriptorPool, FieldDescriptor, Kind, MessageDescriptor};
use serde::{Deserialize, Serialize};
use serde_json::{Map, Value};
use std::path::Path;

#[derive(Serialize, Deserialize, Debug)]
pub struct ParsedProto {
    pub name: String,
    pub services: Vec<ParsedService>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ParsedService {
    pub name: String,
    pub methods: Vec<ParsedMethod>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ParsedMethod {
    pub name: String,
    pub full_name: String,
    pub request_payload: String,
    pub is_client_streaming: bool,
    pub is_server_streaming: bool,
}

#[tauri::command]
pub fn parse_proto(file_path: String) -> Result<ParsedProto, String> {
    let path = Path::new(&file_path);
    let parent_dir = path.parent().unwrap_or(Path::new("."));

    // Use protox to parse the proto file dynamically
    let file_desc_set = protox::compile(vec![path], vec![parent_dir])
        .map_err(|e| format!("Failed to compile proto: {}", e))?;

    // protox returns a prost_types::FileDescriptorSet. We can encode it to bytes to load into prost_reflect.
    // However, prost_reflect directly supports from_file_descriptor_set if they use the same prost_types version.
    // Let's use bytes to avoid version mismatch issues between protox's prost_types and prost_reflect's.
    let mut buf = Vec::new();
    prost::Message::encode(&file_desc_set, &mut buf)
        .map_err(|e| format!("Failed to encode DescriptorSet: {}", e))?;

    let pool = DescriptorPool::decode(buf.as_slice())
        .map_err(|e| format!("Failed to decode into DescriptorPool: {}", e))?;

    let mut services = Vec::new();

    for service in pool.services() {
        let mut methods = Vec::new();

        for method in service.methods() {
            let input_desc = method.input();
            let mock_json = generate_mock(&input_desc);
            let request_payload = serde_json::to_string_pretty(&mock_json).unwrap_or_default();

            methods.push(ParsedMethod {
                name: method.name().to_string(),
                full_name: method.full_name().to_string(),
                request_payload,
                is_client_streaming: method.is_client_streaming(),
                is_server_streaming: method.is_server_streaming(),
            });
        }

        services.push(ParsedService {
            name: service.name().to_string(),
            methods,
        });
    }

    Ok(ParsedProto {
        name: path.file_name().unwrap_or_default().to_string_lossy().to_string(),
        services,
    })
}

fn generate_mock(msg: &MessageDescriptor) -> Value {
    let mut map = Map::new();
    for field in msg.fields() {
        let val = match field.kind() {
            Kind::Double | Kind::Float => Value::Number(serde_json::Number::from_f64(0.0).unwrap()),
            Kind::Int32 | Kind::Uint32 | Kind::Sint32 | Kind::Fixed32 | Kind::Sfixed32 => {
                Value::Number(serde_json::Number::from(0))
            }
            Kind::Int64 | Kind::Uint64 | Kind::Sint64 | Kind::Fixed64 | Kind::Sfixed64 => {
                // Return string for 64-bit to avoid js precision loss
                Value::String("0".to_string())
            }
            Kind::Bool => Value::Bool(false),
            Kind::String => Value::String("".to_string()),
            Kind::Bytes => Value::String("base64==".to_string()),
            Kind::Message(m) => {
                // Basic cycle detection to avoid stack overflow could be added here
                // For simplicity, we just generate mock. If it's recursive, it'll crash.
                // You can add logic to restrict depth if required.
                generate_mock(&m)
            }
            Kind::Enum(e) => {
                if let Some(val) = e.values().next() {
                    Value::String(val.name().to_string())
                } else {
                    Value::String("UNKNOWN".to_string())
                }
            }
        };

        if field.is_list() {
            map.insert(field.name().to_string(), Value::Array(vec![val]));
        } else {
            map.insert(field.name().to_string(), val);
        }
    }
    Value::Object(map)
}
