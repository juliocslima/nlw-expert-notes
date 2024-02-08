import { ChangeEvent, FormEvent, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog'
import { toast } from 'sonner';
import { X } from 'lucide-react'

interface NewNoteProps {
  onNoteCreated: (content: string) => void;
}

let speechRecognition: SpeechRecognition | null = null;

export function NewNoteCard({ onNoteCreated }: NewNoteProps) {

  const [isRecording, setIsRecording] = useState(false);
  const [shouldShowOnBoarding, setShouldShowOnBoarding] = useState(true)
  const [content, setContent] = useState('')

  function handleStartEditor() {
    setShouldShowOnBoarding(false)
  }

  function handleContentChanged(event: ChangeEvent<HTMLTextAreaElement>) {

    setContent(event.target.value)

    if(event.target.value === '') {
      setShouldShowOnBoarding(true)
    }
  }

  function handleSaveNote(event: FormEvent) {
    if (content === '' || content === undefined) {
      toast.error('Não é possivel salvar nota sem conteúdo');
      return
    }

    event.preventDefault()

    onNoteCreated(content);

    setContent('');

    setShouldShowOnBoarding(true);

    toast.success('Nota criada com sucesso!');
  }

  function handleStartRecord() {
    const isSpeechRecognitionAPIAvailble = 'SpeechRecognition' in window 
      || 'webkitSpeechRecognition' in window;

    if(!isSpeechRecognitionAPIAvailble) {
      toast.warning('Infelizmente seu navegador não suporta a API de gravação!');
      return
    }

    setIsRecording(true);
    setShouldShowOnBoarding(false);

    const speechRecognitionAPI = window.webkitSpeechRecognition || window.SpeechRecognition;

    speechRecognition = new speechRecognitionAPI();

    speechRecognition.lang = 'pt-BR';
    speechRecognition.continuous = true;
    speechRecognition.maxAlternatives = 1;
    speechRecognition.interimResults = true;

    speechRecognition.onresult = (event) => {
      const transcription = Array.from(event.results).reduce((text, result)=> {
        return text.concat(result[0].transcript)
      }, '');

      setContent(transcription);
    }

    speechRecognition.onerror = (event) => {
      console.log(event);
    }

    speechRecognition.start();
  }

  function handleStopRecord() {
    setIsRecording(false);

    if (speechRecognition !== null) {
      speechRecognition.stop();
    }
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger className="rounded-md flex flex-col bg-slate-700 text-left p-5 gap-3 outline-none hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400">
        <span className="text-sm font-medium text-slate-200">
          Adicionar nota
        </span>
        <p className="text-sm leading-6 text-slate-400 ">
          Grave uma nota em áudio que será convertida para texto automaticamente.
        </p>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="inset-0 fixed bg-black/60">
          <Dialog.Content className="fixed overflow-hidden inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] w-full md:h-[60vh] bg-slate-700 md:rounded-md flex flex-col outline-none">
            <Dialog.Close className="absolute top-0 right-0 bg-slate-600 p-1.5 text-slate-400 hover:text-slate-100">
              <X className='size-5'/>
            </Dialog.Close>

            <form className="flex-1 flex flex-col">
              <div className="flex flex-1 flex-col gap-3 p-5">
                <span className="text-sm font-medium text-slate-300">
                  Adicionar nota
                </span>
                
                { shouldShowOnBoarding ? (
                  <p className="text-sm leading-6 text-slate-400 ">
                    Comece <button type='button' onClick={handleStartRecord} className='font-medium text-lime-400 hover:underline'>gravando uma nota em áudio</button> ou se preferir <button type='button' onClick={handleStartEditor} className='font-medium text-lime-400 hover:underline'>utilize apenas texto</button>.
                  </p>
                ) : (
                  <textarea 
                    autoFocus
                    className='text-sm leading-6 text-slate-400 bg-transparent resize-none outline-none' 
                    onChange={handleContentChanged}
                    value={content}
                  />
                ) }
              </div>

              { isRecording ? (
                <button
                  type='button'
                  onClick={handleStopRecord}
                  className='w-full flex items-center justify-center gap-2 bg-slate-900 py-4 text-center text-sm text-slate-300 outline-none font-medium hover:text-slate-300'
                >
                  <div className='size-3 rounded-full bg-red-500 animate-pulse'/>
                  Gravando (clique p/ interromper)
                </button>
              ) : (
                <button
                  type='button'
                  onClick={handleSaveNote}
                  className='w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none font-medium hover:bg-lime-500'
                >Salvar nota</button>
              ) }
              

            </form>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}