import { useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { Tweet } from '../components/Tweet' 
import { useTweets } from '../lib/fetchTweets'
import { getTweets } from '../api'
import styles from './styles.module.css'

export default function Feed({ tweets }) {

  const [page, setPage] = useState(2)

  const fetchMore = async () => {
    const moreTweets = await getTweets(page)
    setPage(page + 1)
    setTweets(prev => [...prev, ...moreTweets]) 
  }

  return (
    <div className={styles.feed}>
      <h1>Home</h1>

      <InfiniteScroll
        dataLength={tweets.length}
        next={fetchMore}
        hasMore={true}
        loader={<h4>Loading...</h4>} 
      >
        {tweets.map(tweet => (
          <Tweet 
            key={tweet.id}
            name={tweet.user.name}
            content={tweet.content}
          />
        ))}
      </InfiniteScroll>

    </div>
  )

}

export async function getServerSideProps() {
  const tweets = await getTweets()

  return {
    props: {
      tweets  
    }
  }
}
