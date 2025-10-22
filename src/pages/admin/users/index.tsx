import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import classNames from 'classnames/bind'
import styles from './index.module.scss'
import convertKeywordParamToString from '@ui/shared/util-util/convertKeywordParamToString'
import convertPageParamToNumber from '@ui/shared/util-util/convertPageParamToNumber'
import PageLayout from '@ui/shared/layout/PageLayout/PageLayout'
import { SearchByUser } from '@shared/types'
import SearchBar from '@ui/shared/search-bar/SearchBar'
import { SEARCH_BY_USER_FILTERS } from '@ui/shared/dropdown/constants'
import UserList from '@ui/user/feature-users/UserList'
import Head from 'next/head'
import getPageTitle from '@ui/shared/util-util/getPageTitle'

const cx = classNames.bind(styles)

type UserListPageProps = {
  searchBy: SearchByUser
  keyword: string
  page: number
}

const UserListPage = ({ searchBy, keyword, page }: InferGetServerSidePropsType<typeof getServerSideProps>) => {

  return (
    <>
      <Head>
        <title>{getPageTitle('유저 목록')}</title>
      </Head>
      <PageLayout title='유저 목록'>
        <div className={cx('header')}>
          <SearchBar
            initialSearchBy={searchBy}
            initialKeyword={keyword}
            searchByFilters={SEARCH_BY_USER_FILTERS}
            otherParams={[{ name: 'page', value: 1 }]}
          />
        </div>
        <UserList searchBy={searchBy} keyword={keyword} page={page} />
      </PageLayout>
    </>
  )
}

export const getServerSideProps = (async ({ query }) => {
  const {
    searchBy: searchByParam,
    keyword: keywordParam,
    page: pageParam,
  } = query
  const searchBy = SearchByUser[searchByParam as keyof typeof SearchByUser] || SearchByUser['companyName']
  const keyword = convertKeywordParamToString(keywordParam)
  const page = convertPageParamToNumber(pageParam)
  return {
    props: {
      searchBy,
      keyword,
      page,
    },
  }
}) satisfies GetServerSideProps<UserListPageProps>

export default UserListPage
