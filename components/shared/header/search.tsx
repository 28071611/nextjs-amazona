import { getAllCategories } from '@/lib/actions/product.actions'
import { getSetting } from '@/lib/actions/setting.actions'
import { getTranslations } from 'next-intl/server'
import SearchForm from './search-form'

export default async function Search() {
  const {
    site: { name },
  } = await getSetting()
  const categories = await getAllCategories()

  const t = await getTranslations()
  return (
    <SearchForm
      placeholder={t('Header.Search Site', { name })}
      categories={categories}
      tHeaderAll={t('Header.All')}
    />
  )
}
