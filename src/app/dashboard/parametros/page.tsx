import { createClient } from '@/lib/supabase/server'
import ParametrosClient from './ParametrosClient'

export default async function ParametrosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: companies } = await supabase
    .from('companies')
    .select('id, razon_social')
    .eq('user_id', user!.id)
    .limit(1)

  const company = companies?.[0] || null

  const { data: params } = company
    ? await supabase
        .from('legal_parameters')
        .select('*')
        .eq('company_id', company.id)
        .order('categoria')
    : { data: [] }

  return <ParametrosClient company={company} params={params || []} />
}
