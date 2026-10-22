import { useState } from 'react'

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const subject = encodeURIComponent(`Message from ${form.name}`)
    const body = encodeURIComponent(
      `${form.message}\n\nFrom: ${form.name} (${form.email})`
    )
    window.location.href = `mailto:toro@gmail.com?subject=${subject}&body=${body}`
    setStatus('Your email client should open with a prefilled message.')
    setForm({ name: '', email: '', message: '' })
  }

  return (
    <section className="section">
      <div className="container narrow">
        <h1 className="page-title">Contact Us</h1>
        <p className="page-sub">
          Have a question, feedback, or a business enquiry? Send us a message
          and we will get back to you.
        </p>

        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              rows="5"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
            ></textarea>
          </div>

          <button type="submit" className="btn btn-primary">
            Send Message
          </button>

          {status && <p className="form-status">{status}</p>}
        </form>

        <div className="contact-info">
          <p>
            <strong>Email:</strong> toro@gmail.com
          </p>
          <p>
            <strong>Location:</strong> Rangpur, Bangladesh
          </p>
        </div>
      </div>
    </section>
  )
}

export default Contact
