import { Binary } from 'bson';
import { encrypt, decrypt, message } from 'openpgp';
import { SetupSkyenvProps } from "./interfaces";

function getPgpPasswordFromConfig(config: SetupSkyenvProps): string {
  return `${config.accessId}:${config.accessSecret}`;
}

export async function encryptValue<T>(config: SetupSkyenvProps, value: T[keyof T]): Promise<Binary> {
  const password = getPgpPasswordFromConfig(config);
  const { message: encryptedMessage } = await encrypt({
    message: message.fromText(value),
    passwords: [password],
    armor: false,
  });
  const encryptedBuffer = Buffer.from(encryptedMessage.packets.write());
  return new Binary(encryptedBuffer, Binary.SUBTYPE_BYTE_ARRAY);
}

export async function decryptValue<T>(config: SetupSkyenvProps, encryptedValue: Binary): Promise<T[keyof T]> {
  const password = getPgpPasswordFromConfig(config);
  const { data: decryptedValue } = await decrypt({
    message: await message.read(new Uint8Array(encryptedValue.buffer)),
    passwords: [password],
    format: 'utf8'
  });
  return decryptedValue;
}