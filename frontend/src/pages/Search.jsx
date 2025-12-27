import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Subtitle,
  SearchForm,
  SearchBar,
  Select,
  Input,
  SearchButton,
  Status,
  Results,
} from './Search.styles.jsx';
import ContactCard from '../components/ContactCard.jsx';
import Header from '../components/Header.jsx';
import { url } from '../helpers/url.js';
import { FaSearch } from 'react-icons/fa';

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
  const [isLoading, setIsLoading] = useState(false);

  const trimmedQuery = query.trim();
  const minLength = criteria === 'id' ? 1 : 3;
  const canSearch = trimmedQuery.length >= minLength && !isLoading;

  const runSearch = async () => {
    const q = trimmedQuery;
    if (q.length < minLength) {
      setResults([]);
      setNoResults(false);
      setServerMessage('');
      return;
    }

    const params = new URLSearchParams({ type: 'perfil', field: criteria, q });
    const controller = new AbortController();
    setIsLoading(true);
    try {
      const r = await fetch(`${url}/api/search?${params.toString()}`, {
        signal: controller.signal,
        credentials: 'include',
      });
      const data = r.ok
        ? await r.json()
        : { items: [], meta: { limit: 20, totalEstimado: 0 }, noResults: true, message: 'No se encontraron resultados' };

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
    } catch (err) {
      if (err.name !== 'AbortError') console.error(err);
    } finally {
      setIsLoading(false);
      controller.abort();
    }
  };

  useEffect(() => {
    if (trimmedQuery.length < minLength) {
      setResults([]);
      setNoResults(false);
      setServerMessage('');
    }
  }, [trimmedQuery, minLength]);

  return (
    <>
      <Header />
      <Container>
        <Title>Buscar</Title>
        <Subtitle>Encuentra perfiles por nombre, ID o número</Subtitle>

        <SearchForm
          onSubmit={(e) => {
            e.preventDefault();
            runSearch();
          }}
        >
          <SearchBar>
            <Select value={criteria} onChange={(e) => setCriteria(e.target.value)} aria-label="Criterio de búsqueda">
              {profileOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>

            <Input
              type="text"
              placeholder={criteria === 'id' ? 'Ej: 123' : 'Escribe al menos 3 caracteres...'}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Texto de búsqueda"
            />

            <SearchButton type="submit" disabled={!canSearch} aria-label="Buscar">
              <FaSearch aria-hidden="true" focusable="false" />
              Buscar
            </SearchButton>
          </SearchBar>
        </SearchForm>

        {isLoading ? (
          <Status>Buscando…</Status>
        ) : results.length > 0 ? (
          <Status>{results.length} resultados encontrados</Status>
        ) : (
          (noResults && trimmedQuery.length >= minLength) ? (
            <Status>{serverMessage || 'No se encontraron resultados'}</Status>
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
