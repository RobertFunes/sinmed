import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  SwitchRow,
  SelectorRow,
  Select,
  Input,
  Results,
} from './Search.styles.jsx';
import ContactCard from '../components/ContactCard.jsx';
import PolizaCard from '../components/PolizaCard.jsx';
import Header from '../components/Header.jsx';
import { url } from '../helpers/url.js';

const profileOptions = [
  { value: 'name', label: 'Nombre' },
  { value: 'id', label: 'ID' },
  { value: 'number', label: 'Número' },
];

const policyOptions = [
  { value: 'policyId', label: 'ID de póliza' },
  { value: 'holder', label: 'Contratante' },
  { value: 'policyNumber', label: 'Número de póliza' },
];

// Normaliza cualquier forma rara del backend a lo que espera PolizaCard
const normalizePoliza = (r) => ({
  id_poliza: r.id_poliza ?? r.policyId ?? r.id,
  numero_poliza: r.numero_poliza ?? r.policyNumber ?? r.number,
  aseguradora: r.aseguradora ?? r.insurer ?? r.aseguradora_nombre,
  fecha_inicio_poliza: r.fecha_inicio_poliza ?? r.startDate,
  fecha_termino_poliza: r.fecha_termino_poliza ?? r.endDate,
  titular_id_cliente: r.titular_id_cliente ?? r.holderId ?? r.titularId ?? r.id_cliente,
  // mantenemos el resto por si el card usa más props
  ...r,
});

export default function Search() {
  const [mode, setMode] = useState('perfil');
  const [criteria, setCriteria] = useState(profileOptions[0].value);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const q = query.trim();
    const minLength = criteria === 'id' || criteria === 'policyId' ? 1 : 3;
    if (q.length < minLength) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams({ type: mode, field: criteria, q });

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
  }, [mode, criteria, query]);

  const options = mode === 'perfil' ? profileOptions : policyOptions;

  const handleDelete = async (id_poliza, numero_poliza) => {
    if (!id_poliza) return;
    const ok = window.confirm(
      `¿Eliminar la póliza ${numero_poliza || `ID ${id_poliza}`}? Esta acción no se puede deshacer.`
    );
    if (!ok) return;

    try {
      const res = await fetch(`${url}/api/delete/${id_poliza}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // quitar de los resultados actuales del buscador
      setResults((prev) =>
        prev.filter(
          (raw) => (raw.id_poliza ?? raw.policyId ?? raw.id) !== id_poliza
        )
      );
      alert('✅ Póliza eliminada');
    } catch (err) {
      console.error('Error al eliminar póliza:', err);
      alert('❌ Ocurrió un problema al eliminar');
    }
  };

  return (
    <>
      <Header />
      <Container>
        <SwitchRow>
          <label>
            <input
              type="radio"
              name="mode"
              value="perfil"
              checked={mode === 'perfil'}
              onChange={() => {
                setMode('perfil');
                setCriteria(profileOptions[0].value);
              }}
            />
            Perfil
          </label>
          <label>
            <input
              type="radio"
              name="mode"
              value="poliza"
              checked={mode === 'poliza'}
              onChange={() => {
                setMode('poliza');
                setCriteria(policyOptions[0].value);
              }}
            />
            Póliza
          </label>
        </SwitchRow>

        <SelectorRow>
          <p>Buscar por:</p>
          <Select value={criteria} onChange={(e) => setCriteria(e.target.value)}>
            {options.map((o) => (
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
          {mode === 'perfil'
            ? results.map((p) => <ContactCard key={p.id} {...p} />)
            : results.map((raw) => {
                const p = normalizePoliza(raw);
                return (
                  <PolizaCard
                    key={p.id_poliza}
                    {...p}
                    onView={() =>
                      p.titular_id_cliente &&
                      navigate(`/profile/${p.titular_id_cliente}`)
                    }
                    onEdit={() => p.id_poliza && navigate(`/polizas/${p.id_poliza}/edit`)}
                    onDelete={() => handleDelete(p.id_poliza, p.numero_poliza)}
                  />
                );
              })}
        </Results>
      </Container>
    </>
  );
}
