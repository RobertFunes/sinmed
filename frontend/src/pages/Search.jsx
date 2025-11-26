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
  const [criteria, setCriteria] = useState('id');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const [serverMessage, setServerMessage] = useState('');

  useEffect(() => {
    const q = query.trim();
    const minLength = criteria === 'id' ? 1 : 3;
    if (q.length < minLength) {
      setResults([]);
      setNoResults(false);
      setServerMessage('');
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams({ type: 'perfil', field: criteria, q });

    fetch(`${url}/api/search?${params.toString()}`, {
      signal: controller.signal,
      credentials: 'include',
    })
      .then((r) => (
        r.ok
          ? r.json()
          : { items: [], meta: { limit: 20, totalEstimado: 0 }, noResults: true, message: 'No se encontraron resultados' }
      ))
      .then((data) => {
        const items = Array.isArray(data.items) ? data.items : [];
        setResults(items);
        const empty = items.length === 0;
        const metaZero = data?.meta && typeof data.meta.totalEstimado === 'number' && data.meta.totalEstimado === 0;
        setNoResults(empty || !!data.noResults || metaZero);
        setServerMessage(
          typeof data.message === 'string'
            ? data.message
            : empty
              ? 'No se encontraron resultados'
              : ''
        );
      })
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

        {results.length > 0 ? (
          <p>{results.length} resultados encontrados</p>
        ) : (
          (noResults && query.trim().length >= (criteria === 'id' ? 1 : 3)) ? (
            <p>{serverMessage || 'No se encontraron resultados'}</p>
          ) : null
        )}

        <Results>
          {results.map((p) => (
            <ContactCard key={p.id} {...p} />
          ))}
        </Results>
      </Container>
    </>
  );
}
