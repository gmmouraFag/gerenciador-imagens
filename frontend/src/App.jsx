import { useEffect, useState } from 'react'

const API_URL = 'http://localhost:8000'

function formatDate(value) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
}

export default function App() {
  const [images, setImages] = useState([])
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function loadImages() {
    try {
      const response = await fetch(`${API_URL}/images`)
      if (!response.ok) throw new Error()
      setImages(await response.json())
    } catch {
      setMessage('Não foi possível conectar à API. Confirme se o backend está em execução.')
    }
  }

  useEffect(() => { loadImages() }, [])

  async function handleUpload(event) {
    event.preventDefault()
    if (!file) return setMessage('Selecione uma imagem antes de enviar.')
    setLoading(true)
    setMessage('')
    try {
      const data = new FormData()
      data.append('file', file)
      const response = await fetch(`${API_URL}/images`, { method: 'POST', body: data })
      const result = await response.json()
      if (!response.ok) throw new Error(result.detail || 'Falha no envio.')
      setFile(null)
      event.target.reset()
      setMessage(`"${result.filename}" foi salva com sucesso.`)
      await loadImages()
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <header><h1>Gerenciador de imagens</h1><p>Envie, armazene e consulte imagens no MySQL.</p></header>
      <section className="card">
        <h2>Nova imagem</h2>
        <form onSubmit={handleUpload}>
          <input type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
          <button disabled={loading}>{loading ? 'Enviando…' : 'Salvar imagem'}</button>
        </form>
        {message && <p className="message">{message}</p>}
      </section>
      <section className="card">
        <div className="section-title"><h2>Imagens salvas</h2><button className="secondary" onClick={loadImages}>Atualizar</button></div>
        <div className="table-wrap"><table>
          <thead><tr><th>ID</th><th>Arquivo</th><th>Tipo</th><th>Enviada em</th><th></th></tr></thead>
          <tbody>{images.length ? images.map((image) => <tr key={image.id}>
            <td>{image.id}</td><td>{image.filename}</td><td>{image.content_type}</td><td>{formatDate(image.created_at)}</td>
            <td><button className="secondary" onClick={() => setPreview(image)}>Pré-visualizar</button></td>
          </tr>) : <tr><td colSpan="5">Nenhuma imagem salva.</td></tr>}</tbody>
        </table></div>
      </section>
      {preview && <div className="modal-backdrop" onClick={() => setPreview(null)}><div className="modal" onClick={(event) => event.stopPropagation()}>
        <button className="close" onClick={() => setPreview(null)}>×</button><h2>{preview.filename}</h2>
        <img src={`${API_URL}/images/${preview.id}/content`} alt={preview.filename} />
      </div></div>}
    </main>
  )
}
