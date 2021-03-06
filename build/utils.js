import path from 'path'
const _ = {}

_.isDev = !process.argv.includes('--production')
_.isVerbose = process.argv.includes('--verbose')
_.isAnalyse = process.argv.includes('--analyze') || process.argv.includes('--analyse')

const script = /\.(js|jsx|mjs)$/
const style = /\.(css|less|styl|scss|sass|sss)$/
const image = /\.(bmp|gif|jpg|jpeg|png|svg)$/
_.test = {
  script,
  style,
  image,
}
/**
 * 获取相对路径
 * @param {string} p 路径
 */
_.resolvePath = (p) => {
  return path.resolve(__dirname, p)
}

_.proxy = {
  '/api': {
    target: 'http://192.168.110.101:8082',
    changeOrigin: true
  }
}
module.exports = _