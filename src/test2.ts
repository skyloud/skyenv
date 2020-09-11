import skyenv from '.';

export default function test(): void {
  const myKey = skyenv.get('BENOIT');
  console.log({ myKey });
}