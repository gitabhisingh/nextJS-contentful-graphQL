import { useRouter } from 'next/router'
import Head from 'next/head'
import ErrorPage from 'next/error'
import Container from '../../../components/container'
import PostBody from '../../../components/post-body'
import MoreStories from '../../../components/more-stories'
import Header from '../../../components/header'
import PostHeader from '../../../components/post-header'
import SectionSeparator from '../../../components/section-separator'
import Layout from '../../../components/layout'
import { getAllPostsWithSlug, getPostAndMorePosts } from '../../../lib/api'
import PostTitle from '../../../components/post-title'
import { CMS_NAME } from '../../../lib/constants'

import { Grid } from '@material-ui/core';

export default function Post({ post, morePosts, preview }) {
  // console.log('Post props: ', post)
  const router = useRouter()


  if (!router.isFallback && !post) {
    return <ErrorPage statusCode={404} />
  }

  return (
    <Grid container>
      <Grid item>

      </Grid>
    </Grid>
  )
}

export async function getStaticProps({ params, preview = false }) {
  // console.log('static props: ', params)
  const data = await getPostAndMorePosts(params.lang, params.slug, preview)

  return {
    props: {
      preview,
      post: data?.post ?? null,
      morePosts: data?.morePosts ?? null,
    },
  }
}

export async function getStaticPaths() {
  const allPosts = await getAllPostsWithSlug();
  const localeArr = ['en-US', 'fr-CA']
  const pathArr = [];
  allPosts.map((val) => {
    localeArr.map((v) => {
      pathArr.push({
        params: {
          slug: val.slug,
          lang: v
        }
      })
    })
  });

  return {
    paths: pathArr ?? [],
    fallback: true,
  }
}
