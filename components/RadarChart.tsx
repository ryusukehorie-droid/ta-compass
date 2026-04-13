'use client'

import { useEffect, useRef } from 'react'
import type { ScoreValue } from '@/types'

interface Props {
  scores: ScoreValue[]
  compareScores?: ScoreValue[]
}

const LABELS = [
  'リーダーシップ\nコミットメント',
  '採用戦略・計画',
  'ストーリー\n発信力',
  'ソーシング戦略',
  'タレント\nパイプライン',
  'アトラクト&\nエンゲージ',
  'プロセス\nマネジメント',
  'アセスメント\n品質',
  'データ活用&\n改善サイクル',
  'TAチーム\n組成・配置',
  'TAカルチャー',
]

const ITEM_CATS = [0, 0, 1, 1, 1, 1, 1, 2, 2, 3, 3]

const CAT_FILL   = ['rgba(83,74,183,0.12)', 'rgba(239,159,39,0.12)', 'rgba(55,138,221,0.12)', 'rgba(212,83,126,0.12)']
const CAT_STROKE = ['#534AB7', '#EF9F27', '#185FA5', '#D4537E']
const CAT_LABEL_COLOR = ['#3C3489', '#633806', '#0C447C', '#72243E']
const CAT_LABEL_BG    = ['#EEEDFE', '#FAEEDA', '#E6F1FB', '#FBEAF0']
const CAT_LABEL_TEXT  = ['経営アライン\nメント', 'オペレーション', '品質・評価', '組織・体制']
const CAT_RANGES = [{ s: 0, e: 1 }, { s: 2, e: 6 }, { s: 7, e: 8 }, { s: 9, e: 10 }]

const SCORE_COL = ['#aaa', '#791F1F', '#7A5500', '#27500A', '#085041']
const SCORE_BG  = ['#f7f6f3', '#FCEBEB', '#FFF3CC', '#EAF3DE', '#E1F5EE']
const SCORE_TXT = ['—', 'BAD', 'SOSO', 'GOOD', 'EXC']

export default function RadarChart({ scores, compareScores }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const SIZE = 520
    canvas.width = SIZE * dpr
    canvas.height = SIZE * dpr
    canvas.style.width = `${SIZE}px`
    canvas.style.height = `${SIZE}px`
    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)

    const cx = SIZE / 2, cy = SIZE / 2, R = 156
    const n = LABELS.length
    const ang = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2
    const ptR = (i: number, r: number) => ({ x: cx + r * Math.cos(ang(i)), y: cy + r * Math.sin(ang(i)) })

    // Category arc segments behind the grid
    const sR1 = R, sR2 = R + 13
    for (let ci = 0; ci < 4; ci++) {
      const { s, e } = CAT_RANGES[ci]
      const a1 = ang(s) - Math.PI / n
      const a2 = ang(e) + Math.PI / n
      ctx.beginPath(); ctx.arc(cx, cy, sR2, a1, a2); ctx.arc(cx, cy, sR1, a2, a1, true); ctx.closePath()
      ctx.fillStyle = CAT_FILL[ci].replace('0.12', '0.55'); ctx.fill()
      ctx.strokeStyle = CAT_STROKE[ci]; ctx.lineWidth = 1.5; ctx.stroke()
    }

    // Grid rings (4段階対応)
    for (let r = 1; r <= 4; r++) {
      ctx.beginPath()
      for (let i = 0; i < n; i++) { const p = ptR(i, R * r / 4); i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y) }
      ctx.closePath()
      ctx.strokeStyle = r === 4 ? '#ccc' : '#e8e6e0'; ctx.lineWidth = r === 4 ? 1.5 : 0.8; ctx.stroke()
      ctx.fillStyle = '#bbb'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center'
      ctx.fillText(String(r), cx + 4, cy - R * r / 4 - 4)
    }

    // Spokes
    for (let i = 0; i < n; i++) {
      const op = ptR(i, R)
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(op.x, op.y)
      ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1; ctx.stroke()
    }

    // Category background fill
    for (let ci = 0; ci < 4; ci++) {
      const { s, e } = CAT_RANGES[ci]
      ctx.beginPath(); ctx.moveTo(cx, cy)
      for (let i = s; i <= e; i++) { const p = ptR(i, R); ctx.lineTo(p.x, p.y) }
      ctx.arc(cx, cy, R, ang(e) + Math.PI / n, ang(s) - Math.PI / n, true)
      ctx.closePath(); ctx.fillStyle = CAT_FILL[ci]; ctx.fill()
    }

    // Outer polygon outline
    ctx.beginPath()
    for (let i = 0; i < n; i++) { const p = ptR(i, R); i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y) }
    ctx.closePath(); ctx.strokeStyle = 'rgba(180,180,180,0.7)'; ctx.lineWidth = 1
    ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([])

    // Score polygon
    if (scores.some((v) => v > 0)) {
      ctx.beginPath()
      for (let i = 0; i < n; i++) {
        const v = scores[i] > 0 ? scores[i] : 0
        const p = ptR(i, R * v / 4)
        i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)
      }
      ctx.closePath()
      ctx.fillStyle = 'rgba(83,74,183,0.18)'; ctx.fill()
      ctx.strokeStyle = '#534AB7'; ctx.lineWidth = 2.5; ctx.stroke()
      for (let i = 0; i < n; i++) {
        if (scores[i] > 0) {
          const p = ptR(i, R * scores[i] / 4)
          ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2)
          ctx.fillStyle = '#534AB7'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke()
        }
      }
    }

    // Axis labels
    const labelR = R + 32
    for (let i = 0; i < n; i++) {
      const a = ang(i), lx = cx + labelR * Math.cos(a), ly = cy + labelR * Math.sin(a)
      const lines = LABELS[i].split('\n')
      const fs = 10, lineH = fs + 3
      const cosA = Math.cos(a), sinA = Math.sin(a)
      const align: CanvasTextAlign = Math.abs(cosA) < 0.25 ? 'center' : cosA > 0 ? 'left' : 'right'
      const totalH = lines.length * lineH
      const baseY = sinA < -0.5 ? ly - totalH + fs : sinA > 0.5 ? ly + 2 : ly - totalH / 2 + fs / 2
      ctx.font = `bold ${fs}px sans-serif`; ctx.fillStyle = CAT_LABEL_COLOR[ITEM_CATS[i]]; ctx.textAlign = align
      lines.forEach((l, li) => ctx.fillText(l, lx, baseY + li * lineH))

      const v = scores[i]
      if (v > 0) {
        const lvcol = SCORE_COL[v], lvbg = SCORE_BG[v], lvtxt = SCORE_TXT[v]
        ctx.font = 'bold 9px sans-serif'
        const tw = ctx.measureText(lvtxt).width + 10
        const bY = baseY + totalH + 1
        const bX = align === 'center' ? lx - tw / 2 : align === 'left' ? lx : lx - tw
        ctx.fillStyle = lvbg; ctx.beginPath()
        if (ctx.roundRect) ctx.roundRect(bX, bY - 11, tw, 14, 4)
        else ctx.rect(bX, bY - 11, tw, 14)
        ctx.fill(); ctx.fillStyle = lvcol; ctx.textAlign = 'center'; ctx.fillText(lvtxt, bX + tw / 2, bY)
      }
    }

    // Category arc labels
    const clR = sR2 + 14
    for (let ci = 0; ci < 4; ci++) {
      const { s, e } = CAT_RANGES[ci]
      const mA = (ang(s) + ang(e)) / 2
      const clx = cx + clR * Math.cos(mA), cly = cy + clR * Math.sin(mA)
      const clines = CAT_LABEL_TEXT[ci].split('\n'), cfs = 9, clh = cfs + 2
      const cth = clines.length * clh
      const cosM = Math.cos(mA)
      const ca: CanvasTextAlign = Math.abs(cosM) < 0.25 ? 'center' : cosM > 0 ? 'left' : 'right'
      ctx.font = `bold ${cfs}px sans-serif`
      let mw = 0; clines.forEach((l) => { const w = ctx.measureText(l).width; if (w > mw) mw = w })
      const pad = 5, bw2 = mw + pad * 2, bh2 = cth + pad
      const cby = cly - cth / 2 + cfs / 2
      const bx2 = ca === 'center' ? clx - bw2 / 2 : ca === 'left' ? clx - pad : clx - bw2 + pad
      const by2 = cby - cfs - pad / 2
      ctx.fillStyle = CAT_LABEL_BG[ci]; ctx.beginPath()
      if (ctx.roundRect) ctx.roundRect(bx2, by2, bw2, bh2, 4)
      else ctx.rect(bx2, by2, bw2, bh2)
      ctx.fill(); ctx.strokeStyle = CAT_STROKE[ci]; ctx.lineWidth = 1; ctx.stroke()
      ctx.fillStyle = CAT_LABEL_COLOR[ci]; ctx.textAlign = 'center'
      clines.forEach((l, li) => ctx.fillText(l, bx2 + bw2 / 2, cby + li * clh))
    }
    // Compare polygon (before)
    if (compareScores && compareScores.some((v) => v > 0)) {
      ctx.beginPath()
      for (let i = 0; i < n; i++) {
        const v = compareScores[i] > 0 ? compareScores[i] : 0
        const p = ptR(i, R * v / 4)
        i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)
      }
      ctx.closePath()
      ctx.fillStyle = 'rgba(239,159,39,0.12)'; ctx.fill()
      ctx.strokeStyle = '#EF9F27'; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.stroke()
      ctx.setLineDash([])
      for (let i = 0; i < n; i++) {
        if (compareScores[i] > 0) {
          const p = ptR(i, R * compareScores[i] / 4)
          ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
          ctx.fillStyle = '#EF9F27'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke()
        }
      }
    }
  }, [scores, compareScores])

  return <canvas ref={canvasRef} style={{ width: 520, height: 520 }} />
}
