import { useQuery } from 'react-query'
import { tweets } from '../pages/api/tweets'
 
export function useTweets(page) {
  return useQuery(['tweets', page], async () => {

    const tweets = await tweets(page)

    return tweets

  }, {
    keepPreviousData: true,
    staleTime: 5000
  })

}
