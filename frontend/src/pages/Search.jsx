import { useState, useEffect } from 'react';
import {
  Container,
  SelectorRow,
  Select,
  Input,
  Results,
} from './Search.styles.jsx';
import ContactCard from '../components/ContactCard.jsx';
import Header from '../components/Header.jsx';
import { url } from '../helpers/url.js';

const profileOptions = [
  { value: 'name', label: 'Nombre' },
  { value: 'id', label: 'ID' },
  { value: 'number', label: 'Número' },
];

// Eliminado: búsqueda de pólizas. Solo perfiles.

export default function Search() {
  const [criteria, setCriteria] = useState(profileOptions[0].value);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    const q = query.trim();
    const minLength = criteria === 'id' ? 1 : 3;
    if (q.length < minLength) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams({ type: 'perfil', field: criteria, q });

    fetch(`${url}/api/search?${params.toString()}`, {
      signal: controller.signal,
      credentials: 'include',
    })
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((data) => setResults(Array.isArray(data.items) ? data.items : []))
      .catch((err) => {
        if (err.name !== 'AbortError') console.error(err);
      });

    return () => controller.abort();
  }, [criteria, query]);

  return (
    <>
      <Header />
      <Container>
        <SelectorRow>
          <p>Buscar por:</p>
          <Select value={criteria} onChange={(e) => setCriteria(e.target.value)}>
            {profileOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          <Input
            type="text"
            placeholder="Escribe para buscar..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </SelectorRow>

        {results.length > 0 ? <p>{results.length} resultados encontrados</p> : null}

        <Results>
          {results.map((p) => (
            <ContactCard key={p.id} {...p} />
          ))}
        </Results>
      </Container>
    </>
  );
}
