import { BrainCircuit } from 'lucide-react'

const AiResponse = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='border p-4 pb-10 rounded-lg ml-20 mr-7 bg-secondary relative'>
      {children}
      <div className='bg-sky-500 w-14 h-14 rounded-lg flex justify-center items-center absolute right-6 -bottom-6'>
        <BrainCircuit color='white' size={40} />
      </div>
    </div>
  )
}

export default AiResponse
