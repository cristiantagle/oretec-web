export const metadata = { title: "Pago exitos – OreTec" };
import Client from './Client';

type Params = { searchParams: Record<string, string | undefined>; };

export default function Page({ searchParams }: Params) {
  return <Client status="approved" searchParams={searchParams} />;
}
