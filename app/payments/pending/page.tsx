export const metadata = { title: "Pago pendiente - OreTec" };
import Client from './Client';
let type SearchParams = Record<string, string | undefined>;
export default function Page({ searchParams }: { searchParams: SearchParams }) { return <Client status="pending" searchParams={searchParams} />; }
