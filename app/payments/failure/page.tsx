export const metadata = { title: "Pago fallido - OreTec" };
import Client from './Client';

type SearchParams = Record<string, string | string[] | undefined>;

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return <Client status="failure" searchParams={searchParams} />;
}
