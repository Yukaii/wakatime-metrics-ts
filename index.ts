import * as superagent from 'superagent'
import * as humanizeDuration from 'humanize-duration'

if (process.env.NODE_ENV === 'development') {
  require('dotenv').config()
}

type WakaTimeLanguage = {
  data: Array<{
    name: string,
    percent: number
  }>
}

type WakaTimeActivity = {
  data: Array<{
    grand_total: {
      digital: string,
      hours: number,
      minutes: number,
      text: string,
      total_seconds: number
    },
    range: {
      date: string,
      end: string,
      start: string,
      text: string,
      timezone: string
    }
  }>
}

const generateMetrics = async () => {
  const { body: langMetrics } : { body: WakaTimeLanguage } = await superagent.get(process.env.WAKATIME_LANGUAGE)
  const { body: activity }: { body: WakaTimeActivity } = await superagent.get(process.env.WAKATIME_ACTIVITY)

  const { data } = langMetrics

  const top5Langs = data.slice(0, 5)
  const maxNameLength = Math.max(...top5Langs.map(lang => lang.name.length))

  const totalSeconds = activity.data.reduce((acc, item) => item.grand_total.total_seconds + acc, 0)

  const times = top5Langs.map(lang => humanizeDuration(Math.round(totalSeconds * lang.percent / 100) * 1000, {
    units: ['h', 'm'],
    round: true
  }))
  const maxTimeLength = Math.max(...times.map(time => time.length))

  return top5Langs.map((lang, idx) => {
    const block = Math.round(25 * lang.percent / 100)
    const blocks = Array(block).fill('█').join('')
    const time = humanizeDuration(Math.round(totalSeconds * lang.percent / 100) * 1000, {
      units: ['h', 'm'],
      round: true,
      delimiter: ' '
    })

    return [
      lang.name.padEnd(maxNameLength + 2),
      time.padStart(maxTimeLength),
      '  ',
      blocks.padEnd(25, '░'),
      ' ',
      `${lang.percent}`.padStart(5),
      '%',
    ].join('')
  }).join('\n')
}

;(async () => {
  const metrics = await generateMetrics()

  await superagent
    .patch(`https://api.github.com/gists/${process.env.GIST_ID}`)
    .set('Authorization', `token ${process.env.GIST_TOKEN}`)
    .set('User-Agent', 'wakatime-metrics-ts')
    .send({
      files: {
        "📊 Weekly development breakdown": {
          content: metrics
        }
      }
    })

  process.exit(0)
})()
