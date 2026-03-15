import { getAllCategories } from '@/lib/actions/product.actions'
import { getSetting } from '@/lib/actions/setting.actions'
import SearchForm from './search-form'

import data from '@/lib/data'

export default async function Search() {
  const settings = await getSetting()
  const site = settings?.site || data.settings[0].site
  const categories = await getAllCategories()
  
  return (
    <SearchForm
      placeholder={`Search ${site.name}`}
      categories={categories}
      tHeaderAll="All"
    />
  )
}
