export const metadata = { title: "Pago exitoso - OreTec" };
import Client from './Client';

let type SearchParams = Record<string, string | undefined>;

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return <Client status="approved" searchParams={searchParams} />;
}
