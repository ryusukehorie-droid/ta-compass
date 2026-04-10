import { CAT_PILL } from '@/lib/data'

interface Props {
  cat: number
  label: string
  small?: boolean
}

export default function Pill({ cat, label, small }: Props) {
  const { bg, text } = CAT_PILL[cat] ?? CAT_PILL[0]
  return (
    <span
      className={`inline-block font-medium rounded-[10px] whitespace-nowrap ${bg} ${text} ${
        small ? 'text-[10px] px-1.5 py-0' : 'text-[10px] px-2 py-0.5'
      }`}
    >
      {label}
    </span>
  )
}
