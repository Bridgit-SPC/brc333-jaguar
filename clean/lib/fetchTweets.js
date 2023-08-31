import { useQuery } from 'react-query'

import { getTweets } from 'api' 

export function useTweets(page) {

  return useQuery(['tweets', page], async () => {

    const tweets = await getTweets(page)

    return tweets

  }, {
    keepPreviousData: true,
    staleTime: 5000
  })

}
