export default async (req, res) => {
  const tweets = await db.tweets.find()
  res.json(tweets)
}
