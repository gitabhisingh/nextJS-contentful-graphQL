import { createClient } from 'contentful'

const allPostsQuery = `
    query{
      postCollection{
        items {
          title
          slug
          excerpt
          date
          content {
            json
          }
          coverImage {
            title
            description
            contentType
            fileName
            size
            url
            width
            height
          }
          author {
            name
            picture{
              url
            }
          }
        }
      }
    }
  `

function fetchFromGraphQL(query, parseGraphQLPostEntries) {
  return fetch(`https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}?access_token=${process.env.CONTENTFUL_ACCESS_TOKEN}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  }).then(response => response.json()).then(json => parseGraphQLPostEntries(json.data))
}

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
})

const previewClient = createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN,
  host: 'preview.contentful.com',
})

const getClient = (preview) => (preview ? previewClient : client)

function parseAuthor({ fields }) {
  return {
    name: fields.name,
    picture: fields.picture.fields.file,
  }
}

function parsePost({ fields }) {
  return {
    title: fields.title,
    slug: fields.slug,
    date: fields.date,
    content: fields.content,
    excerpt: fields.excerpt,
    coverImage: fields.coverImage.fields.file,
    author: parseAuthor(fields.author),
  }
}

function parsePostEntries(entries, cb = parsePost) {
  return entries?.items?.map(cb)
  // return entries
}
function parseGraphQLPostEntries(entries, cb = parsePost) {
  return entries?.postCollection?.items;
}

export async function getPreviewPostBySlug(slug) {
  const entries = await getClient(true).getEntries({
    content_type: 'post',
    limit: 1,
    'fields.slug[in]': slug,
  })
  return parsePostEntries(entries)[0]
}

export async function getAllPostsWithSlug() {
  const entries = await client.getEntries({
    content_type: 'post',
    select: 'fields.slug',
  })
  return parsePostEntries(entries, (post) => post.fields)
}

export async function getAllPostsForHome(preview) {
  return fetchFromGraphQL(allPostsQuery, parseGraphQLPostEntries);
}

export async function getPostAndMorePosts(slug, preview) {
  const entry = await getClient(preview).getEntries({
    content_type: 'post',
    limit: 1,
    'fields.slug[in]': slug,
  })
  const entries = await getClient(preview).getEntries({
    content_type: 'post',
    limit: 2,
    order: '-fields.date',
    'fields.slug[nin]': slug,
  })

  return {
    post: parsePostEntries(entry)[0],
    morePosts: parsePostEntries(entries),
  }
}