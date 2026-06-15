﻿export async function request(url, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  }

  const finalOptions = { ...defaultOptions, ...options }

  // 如果是 FormData (如上传文件)，让浏览器自己设置带 boundary 的 Content-Type
  if (options.body && options.body instanceof FormData) {
    delete finalOptions.headers['Content-Type']
  }

  try {
    const response = await fetch(url, finalOptions)
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || response.statusText)
    }
    // 处理空响应
    const text = await response.text()
    return text ? JSON.parse(text) : {}
  } catch (error) {
    console.error(`Request failed for ${url}:`, error)
    throw error
  }
}
