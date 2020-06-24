/* global gsap */

const DEFAULT_OPTIONS = {
  color: '#000000',
  colors: ['#0dafb7', '#eabc36', '#e154ed', '#62d628'],
  revealProperty: 'y',
  revealAmount: -6,
  revealDuration: 0.8,
  revealEase: 'elastic',
  strokeDuration: 1,
  strokeEase: 'slow',
  offsetDuration: 0.15,
  staggerAmount: 0.1,
  staggerEase: 'none'
}

function motext (selector, options = {}) { // eslint-disable-line no-unused-vars
  options = { ...DEFAULT_OPTIONS, ...options }
  const targets = document.querySelectorAll(selector)
  const timelines = []
  Array.from(targets).forEach(target => {
    prepSVG(options)
    insertHTML(target, options)
    timelines.push(createTimeline(target, options))
  })
  return timelines
}

function prepSVG (options) {
  const font = svgContent().getElementById('motext')
  prepFontStyles(font, options)
  layerCharacters(font, options)
}

function svgContent () {
  return document.querySelector('[data-font="motext"]').contentDocument
}

function prepFontStyles (font, options) {
  Array.from(font.children).forEach(char => {
    char.removeAttribute('transform')
    char.removeAttribute('opacity')
    char.setAttribute('class', 'motext-colored')

    const strokes = Array.from(char.children)
    strokes.forEach(stroke => {
      const length = stroke.getTotalLength() + 1
      stroke.style.strokeDasharray = length
      stroke.style.strokeDashoffset = length
    })
  })
}

function layerCharacters (font, options) {
  Array.from(font.children).forEach(char => {
    const charLayer = char.cloneNode(true)
    charLayer.setAttribute('class', 'motext-solid')
    charLayer.setAttribute('id', char.id + 'l')
    charLayer.setAttribute('stroke', options.color)
    font.appendChild(charLayer)
  })
}

function insertHTML (target, options) {
  const BASE_SVG_FONT_SIZE = 55
  const fontSize = getFontSize(target)
  const scale = fontSize / BASE_SVG_FONT_SIZE
  let html = '<span class="motext"><span class="motext-word">'
  target.textContent.split('').forEach(char => {
    if (char === ' ') {
      html += '</span><span class="motext-word">'
    } else {
      const svgChar = svgContent().querySelector('#' + char)
      const svgLayer = svgContent().querySelector('#' + char + 'l')
      const size = svgChar.getBBox()
      html += openSVG(size.width + 10, size.height + 10, scale)
      html += svgChar.outerHTML
      html += svgLayer.outerHTML
      html += '</g></svg>'
    }
  })
  html += '</span></span>'
  target.innerHTML = html
  applyColors(target, options)
}

function getFontSize (target) {
  let fontSize = window.getComputedStyle(target, null).getPropertyValue('font-size')
  fontSize = parseFloat(fontSize)
  return fontSize
}

function applyColors (target, options) {
  let color = options.colors[0]
  Array.from(target.querySelectorAll('.motext-colored')).forEach(char => {
    char.setAttribute('stroke', color)
    let index = options.colors.indexOf(color) + 1
    if (index >= options.colors.length) {
      index = 0
    }
    color = options.colors[index]
  })
}

function createTimeline (target, options) {
  const colored = target.querySelectorAll('.motext-colored path, .motext-colored polyline')
  const tl = gsap.timeline()
  tl.to(colored, {
    duration: options.strokeDuration,
    ease: options.strokeEase,
    strokeDashoffset: 0,
    stagger: {
      each: options.staggerAmount,
      ease: options.staggerEase,
      onStart: function () {
        revealCharacter.call(this, options)
      }
    }
  })
  const solid = target.querySelectorAll('.motext-solid path, .motext-solid polyline')
  tl.to(solid, {
    duration: options.strokeDuration,
    ease: options.strokeEase,
    strokeDashoffset: 0,
    stagger: {
      each: options.staggerAmount,
      ease: options.staggerEase
    }
  }, options.offsetDuration)
  tl.pause()
  return tl
}

function revealCharacter (options) {
  const target = this.targets()[0].closest('.motext-letter')
  if (!target.getAttribute('data-revealed')) {
    const revealParams = {
      ease: options.revealEase,
      duration: options.revealDuration
    }
    revealParams[options.revealProperty] = options.revealAmount
    gsap.from(target, revealParams)
    target.setAttribute('data-revealed', true)
  }
}

function openSVG (width, height, scale) {
  return `<svg class="motext-letter" width="${width * scale}px" height="${height * scale}px" viewBox="0 0 ${width} ${height}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g class="motext-letterInner" stroke-width="10" stroke-linecap="square" stroke-linejoin="bevel" fill="none" transform="translate(5, 5)">`
}