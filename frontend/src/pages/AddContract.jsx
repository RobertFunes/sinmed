// AddContract.jsx
import { useMemo, useState } from 'react';
import Header from '../components/Header';
import { useEffect } from 'react';
import {
  AddContainer,
  FormCard,
  Title,
  Form,
  FieldGroup,
  Label,
  Input,
  TextArea,
  Select,
  ButtonRow,
  SubmitButton,
  CancelButton,
  TwoColumnRow,
  FullWidthSelect
} from './Add.styles';
import { Palette } from '../helpers/theme';
import { url } from '../helpers/url';

// Icons
import { AiFillStar } from 'react-icons/ai';
import { FaShieldAlt, FaFileContract, FaCalendarAlt, FaUserCircle, FaTags, FaPlusCircle, FaTrash, FaUsers } from 'react-icons/fa';

// ───────────────────────────────────────────────────────────────────────────────
// Catálogos
const ASEGURADORAS = [
  'GNP','Qualitas','Chubb','Axa','Mapfre','Bx+','Seguros Monterrey','Allianz','Sura','Banorte','Otros'
];
const PERIODICIDADES = ['Mensual','Bimestral','Trimestral','Semestral','Anual'];
const POLIZA_MENU = {
  Vida: ['Retiro', 'Ahorro', 'Profesional', 'Inversión'],
  Autos: [],
  'Gastos médicos': [],
  Daños: {
    Personal: ['Mascota', 'Hogar'],
    Pyme: ['Negocios', 'Empresarial', 'Responsabilidad Civil', 'Maquinaria', 'Seguro a la mercancía']
  }
};
const TOP_LEVEL = Object.keys(POLIZA_MENU);
const MANUAL_SUBCATS = ['Autos', 'Gastos médicos'];

// ───────────────────────────────────────────────────────────────────────────────
// Estado inicial
const initialPolicy = {
  aseguradora: '',
  numero_poliza: '',
  categoria_poliza: '',
  subcategoria_poliza: '',
  detalle_poliza: '',
  fecha_inicio_poliza: '',
  fecha_termino_poliza: '',
  titular_id_cliente: '',
  forma_pago: '',
  periodicidad_pago: '',
  notas: '',
  notas_participantes: ''
};

const AddContract = () => {
  // Drafts
  const [policy, setPolicy] = useState(initialPolicy);
  const [asegurados, setAsegurados] = useState([]);              // [{cliente_id, nombre}]
  const [beneficiarios, setBeneficiarios] = useState([]);        // [{cliente_id, nombre, porcentaje}]
  const [clientCache, setClientCache] = useState({});            // { [id]: { id, nombre } }

  // UI flags
  const [savingAll, setSavingAll] = useState(false);
  const [resolvingId, setResolvingId] = useState(false);
  const [errors, setErrors] = useState({});

  // Inputs rápidos para las listas
  const [aseguradoInput, setAseguradoInput] = useState('');
  const [benefInputId, setBenefInputId] = useState('');
  const [benefInputPct, setBenefInputPct] = useState('');
  const [titularStatus, setTitularStatus] = useState('idle'); 
  // idle | validating | valid | not_found | error
  const [titularMsg, setTitularMsg] = useState('');
  const titularResolved = useMemo(() => {
    const id = Number(policy.titular_id_cliente);
    return clientCache[id];
  }, [policy.titular_id_cliente, clientCache]);
  const [benefStatus, setBenefStatus] = useState('idle'); // idle|validating|valid|not_found|error
  const [benefMsg, setBenefMsg] = useState('');
  const benefResolved = useMemo(() => {
    const id = Number(benefInputId);
    return Number.isInteger(id) && id > 0 ? clientCache[id] : null;
  }, [benefInputId, clientCache]);

  const [asegStatus, setAsegStatus] = useState('idle');      // idle|validating|valid|not_found|error
  const [asegMsg, setAsegMsg] = useState('');
  const asegResolved = useMemo(() => {
    const id = Number(aseguradoInput);
    return Number.isInteger(id) && id > 0 ? clientCache[id] : null;
  }, [aseguradoInput, clientCache]);
  const participantes = useMemo(() => ([
    ...asegurados.map(a => ({ cliente_id: Number(a.cliente_id), rol: 'asegurado' })),
    ...beneficiarios.map(b => ({
      cliente_id: Number(b.cliente_id),
      rol: 'beneficiario',
      porcentaje: Number(b.porcentaje)
    }))
  ]), [asegurados, beneficiarios]);
  const Required = () => (
    <AiFillStar
      style={{ marginLeft: '0.25rem', verticalAlign: 'middle', color: Palette.cyan, fontSize: '1.4rem' }}
      title="Obligatorio"
    />
  );
  const canAddAsegurado =
    asegStatus === 'valid' &&
    asegResolved?.nombre &&                  // ✅ exige nombre
    !asegurados.some(a => a.cliente_id === asegResolved.id) &&
    !resolvingId;
  const pctNum = Number(String(benefInputPct).replace(',', '.'));
  const pctOk =
    benefInputPct !== '' &&
    !Number.isNaN(pctNum) &&
    pctNum >= 0 &&
    pctNum <= 100;
  const canAddBeneficiario =
    benefStatus === 'valid' &&
    pctOk &&
    Number(benefInputId) > 0 &&
    !beneficiarios.some(b => b.cliente_id === Number(benefInputId)) &&
    !resolvingId;
  // ─────────────────────────────────────────────────────────────────────────────
  // Helpers
  const handlePolicyChange = ({ target: { name, value } }) => {
    setPolicy(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoria = ({ target: { value } }) => {
    setPolicy(prev => ({
      ...prev,
      categoria_poliza: value,
      subcategoria_poliza: '',
      detalle_poliza: ''
    }));
  };
  const handleSubcategoria = ({ target: { value } }) => {
    setPolicy(prev => ({
      ...prev,
      subcategoria_poliza: value,
      detalle_poliza: ''
    }));
  };
  const handleTitularChange = (e) => {
    const value = e.target.value.replace(/\D+/g, ''); // solo números
    setPolicy(prev => ({ ...prev, titular_id_cliente: value }));
    setTitularStatus(value ? 'validating' : 'idle');
    setTitularMsg('');
  };
  const normalize = obj =>
    Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]));

  const uniqueById = (arr, idKey = 'cliente_id') => {
    const seen = new Set();
    return arr.filter(x => {
      const key = Number(x[idKey]);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Resolver ID -> nombre con caché
  const resolveClient = async (idRaw) => {
    const id = Number(String(idRaw).trim());
    if (!Number.isInteger(id) || id <= 0) throw new Error('ID inválido');

    if (clientCache[id]) return clientCache[id];

    setResolvingId(true);
    try {
      // Tu ruta real: /api/profile/:id/min protegida con cookie auth
      const res = await fetch(`${url}/api/profile/${id}/min`, { credentials: 'include' });
      if (!res.ok) {
        if (res.status === 404) throw new Error('ID no encontrado');
        throw new Error(`Error ${res.status}`);
      }
      const data = await res.json(); // { id, nombre }
      setClientCache(prev => ({ ...prev, [id]: { id: data.id, nombre: data.nombre } }));
      return { id: data.id, nombre: data.nombre };
    } finally {
      setResolvingId(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Acciones de listas
  const addAsegurado = async () => {
    if (asegStatus !== 'valid') return;

    // si por timing no hay nombre en cache, lo resolvemos aquí
    const rec = asegResolved?.nombre
      ? asegResolved
      : await resolveClient(aseguradoInput);

    if (asegurados.some(a => a.cliente_id === rec.id)) {
      setErrors(e => ({ ...e, asegurados: `El cliente ${rec.id} ya está como asegurado` }));
      return;
    }

    setAsegurados(prev =>
      uniqueById([...prev, { cliente_id: rec.id, nombre: rec.nombre }])
    );
    setErrors(e => ({ ...e, asegurados: null }));
    setAseguradoInput('');
    setAsegStatus('idle');
    setAsegMsg('');
  };


  const removeAsegurado = (id) => {
    setAsegurados(prev => prev.filter(a => a.cliente_id !== id));
  };

  const addBeneficiario = async () => {
    if (benefStatus !== 'valid') return;

    const pct = Number(benefInputPct);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      setErrors(e => ({ ...e, beneficiarios: 'Porcentaje inválido (0 a 100)' }));
      return;
    }

    const rec = benefResolved?.nombre
      ? benefResolved
      : await resolveClient(benefInputId);

    if (beneficiarios.some(b => b.cliente_id === rec.id)) {
      setErrors(e => ({ ...e, beneficiarios: `El cliente ${rec.id} ya está como beneficiario` }));
      return;
    }

    setBeneficiarios(prev =>
      uniqueById([...prev, { cliente_id: rec.id, nombre: rec.nombre, porcentaje: pct }])
    );
    setErrors(e => ({ ...e, beneficiarios: null }));
    setBenefInputId('');
    setBenefInputPct('');
    setBenefStatus('idle');
    setBenefMsg('');
  };

  const updateBeneficiarioPct = (id, value) => {
    const pct = value === '' ? '' : Number(value);
    if (pct !== '' && (isNaN(pct) || pct < 0 || pct > 100)) {
      setErrors(e => ({ ...e, beneficiarios: 'Porcentaje inválido (0 a 100)' }));
      return;
    }
    setBeneficiarios(prev =>
      prev.map(b => (b.cliente_id === id ? { ...b, porcentaje: pct === '' ? '' : pct } : b))
    );
    setErrors(e => ({ ...e, beneficiarios: null }));
  };

  const removeBeneficiario = (id) => {
    setBeneficiarios(prev => prev.filter(b => b.cliente_id !== id));
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Validaciones antes de enviar
  const validateBeforeSave = () => {
    const errs = {};
    if (!policy.numero_poliza.trim()) errs.numero_poliza = 'Requerido';
    if (!policy.titular_id_cliente || isNaN(Number(policy.titular_id_cliente))) {
      errs.titular_id_cliente = 'Contratante requerido';
    }
    if (policy.fecha_inicio_poliza && policy.fecha_termino_poliza) {
      const ini = new Date(policy.fecha_inicio_poliza);
      const fin = new Date(policy.fecha_termino_poliza);
      if (fin < ini) errs.fechas = 'La fecha de término no puede ser anterior al inicio';
    }
    if (policy.prima !== '' && policy.prima != null) {
      const n = Number(String(policy.prima).replace(',', '.'));
      if (!Number.isFinite(n) || n < 0) {
        errs.prima = 'Prima inválida (debe ser un número ≥ 0)';
      }
    }
    // Benef porcentajes numéricos (no bloqueamos suma ≠ 100)
    const badPct = beneficiarios.find(b => b.porcentaje === '' || isNaN(Number(b.porcentaje)));
    if (badPct) errs.beneficiarios = 'Hay porcentajes vacíos o inválidos';
    if (policy.notas && policy.notas.length > 2500) errs.notas = 'Máximo 2500 caracteres';
    if (policy.notas_participantes && policy.notas_participantes.length > 2500)
      errs.notas_participantes = 'Máximo 2500 caracteres';
    return errs;
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Guardar TODO con un solo botón
  const handleSaveAll = async (e) => {
    e.preventDefault();

    // 1) Validación básica
    const v = validateBeforeSave();
    setErrors(v);
    if (Object.keys(v).length) return;

    setSavingAll(true);
    try {
      // 2) Normaliza y arma SOLO los campos que el backend acepta
      const base = normalize({
        ...policy,
        titular_id_cliente: Number(policy.titular_id_cliente)
      });
      const primaNum =
        base.prima === '' || base.prima == null
          ? null
          : Number(String(base.prima).replace(',', '.'));

      // defensa extra (ya validaste arriba, pero por si acaso)
      if (primaNum != null && (!Number.isFinite(primaNum) || primaNum < 0)) {
        throw new Error('prima inválida');
      }
      const payloadPoliza = {
        aseguradora:        base.aseguradora || null,
        numero_poliza:      base.numero_poliza,                  // requerido
        categoria_poliza:   base.categoria_poliza || null,
        subcategoria_poliza:base.subcategoria_poliza || null,
        fecha_inicio_poliza:base.fecha_inicio_poliza || null,
        fecha_termino_poliza:base.fecha_termino_poliza || null,
        titular_id_cliente: base.titular_id_cliente,             // requerido
        forma_pago:         base.forma_pago || null,
        periodicidad_pago:  base.periodicidad_pago || null,
        prima:              primaNum == null ? null : Number(primaNum.toFixed(2)),
        notas: (base.notas || base.detalle_poliza || '').trim() || null,
        notas_participantes: (base.notas_participantes || '').trim() || null
      };

      // 3) Backend espera [poliza, participantes]
      const combo = [payloadPoliza, participantes];

      // 4) POST a variableDelHelper/api/bundle
      const res = await fetch(`${url}/api/bundle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(combo)
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`Error al crear póliza/participantes. ${txt}`);
      }

      // 5) Confirmación rápida
      const data = await res.json().catch(() => ({}));
      const id_poliza = data.id_poliza ?? data.id ?? data.poliza_id;
      if (!id_poliza) throw new Error('El servidor no devolvió id_poliza');

      alert(`✅ Póliza creada con ID ${id_poliza} y ${participantes.length} participante(s)`);

      // 6) Reset
      setPolicy(initialPolicy);
      setAsegurados([]);
      setBeneficiarios([]);
      setErrors({});
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error al guardar');
    } finally {
      setSavingAll(false);
    }
  };



  const handleCancelAll = () => {
    setPolicy(initialPolicy);
    setAsegurados([]);
    setBeneficiarios([]);
    setErrors({});
  };
  useEffect(() => {
    const raw = policy.titular_id_cliente;
    if (!raw) { setTitularStatus('idle'); setTitularMsg(''); return; }

    const id = Number(raw);
    if (!Number.isInteger(id) || id <= 0) {
      setTitularStatus('error');
      setTitularMsg('Solo números mayores a 0');
      return;
    }

    // cache hit
    if (clientCache[id]) { 
      setTitularStatus('valid'); 
      setTitularMsg(''); 
      return; 
    }

    setTitularStatus('validating');
    const t = setTimeout(async () => {
      try {
        await resolveClient(id);     // ya la tienes; cachea internamente
        setTitularStatus('valid');
        setTitularMsg('');
      } catch (err) {
        if (err.message === 'ID no encontrado') {
          setTitularStatus('not_found');
          setTitularMsg('ID no encontrado');
        } else if (String(err.message).includes('401') || String(err.message).includes('403')) {
          setTitularStatus('error');
          setTitularMsg('Necesitas iniciar sesión');
        } else {
          setTitularStatus('error');
          setTitularMsg('Error al validar ID');
        }
      }
    }, 350);

    return () => clearTimeout(t);
  }, [policy.titular_id_cliente, clientCache]);
  useEffect(() => {
    const polizaPreview = normalize({
      ...policy,
      titular_id_cliente: policy.titular_id_cliente ? Number(policy.titular_id_cliente) : null
    });
    console.log('🛰️ Draft payload contrato:', {
      poliza: polizaPreview,
      participantes
    });
  }, [policy, participantes]);
  useEffect(() => {
    const raw = aseguradoInput;
    if (!raw) { setAsegStatus('idle'); setAsegMsg(''); return; }

    const id = Number(raw);
    if (!Number.isInteger(id) || id <= 0) {
      setAsegStatus('error');
      setAsegMsg('Solo números mayores a 0');
      return;
    }

    // cache hit
    if (clientCache[id]) { setAsegStatus('valid'); setAsegMsg(''); return; }

    setAsegStatus('validating');
    const t = setTimeout(async () => {
      try {
        await resolveClient(id);     // ya cachea internamente
        setAsegStatus('valid');
        setAsegMsg('');
      } catch (err) {
        if (err.message === 'ID no encontrado') {
          setAsegStatus('not_found'); setAsegMsg('ID no encontrado');
        } else if (String(err.message).includes('401') || String(err.message).includes('403')) {
          setAsegStatus('error'); setAsegMsg('Necesitas iniciar sesión');
        } else {
          setAsegStatus('error'); setAsegMsg('Error al validar ID');
        }
      }
    }, 350);

    return () => clearTimeout(t);
  }, [aseguradoInput, clientCache]);
  useEffect(() => {
    const raw = benefInputId;
    if (!raw) { setBenefStatus('idle'); setBenefMsg(''); return; }

    const id = Number(raw);
    if (!Number.isInteger(id) || id <= 0) {
      setBenefStatus('error');
      setBenefMsg('Solo números mayores a 0');
      return;
    }

    if (clientCache[id]) { setBenefStatus('valid'); setBenefMsg(''); return; }

    setBenefStatus('validating');
    const t = setTimeout(async () => {
      try {
        await resolveClient(id); // cachea internamente
        setBenefStatus('valid');
        setBenefMsg('');
      } catch (err) {
        if (err.message === 'ID no encontrado') {
          setBenefStatus('not_found'); setBenefMsg('ID no encontrado');
        } else if (String(err.message).includes('401') || String(err.message).includes('403')) {
          setBenefStatus('error'); setBenefMsg('Necesitas iniciar sesión');
        } else {
          setBenefStatus('error'); setBenefMsg('Error al validar ID');
        }
      }
    }, 350);

    return () => clearTimeout(t);
  }, [benefInputId, clientCache]);
  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  return (
    <>
      <Header />
      <AddContainer>
        <FormCard>
          <Title>
            <span>ADD-Contract</span> crear póliza y participantes
          </Title>

          <Form onSubmit={handleSaveAll}>
            {/* ───────────────────────────── Datos de póliza ───────────────────────────── */}
            <FieldGroup>

              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="aseguradora">
                    <FaShieldAlt style={{ marginRight: '0.5rem' }} />
                    Aseguradora
                  </Label>
                  <Select
                    id="aseguradora"
                    name="aseguradora"
                    value={policy.aseguradora}
                    onChange={handlePolicyChange}
                  >
                    <option value="">-- Selecciona --</option>
                    {ASEGURADORAS.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </Select>
                </FieldGroup>

                <FieldGroup>
                  <Label htmlFor="numero_poliza">
                    <FaFileContract style={{ marginRight: '0.5rem' }} />
                    No. de póliza <Required />
                  </Label>
                  <Input
                    id="numero_poliza"
                    name="numero_poliza"
                    value={policy.numero_poliza}
                    onChange={handlePolicyChange}
                    placeholder="Ej: 670191378"
                    required
                  />
                  {errors.numero_poliza && <small style={{ color: 'crimson' }}>⚠️ {errors.numero_poliza}</small>}
                </FieldGroup>
              </TwoColumnRow>

              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="titular_id_cliente">
                    <FaUserCircle style={{ marginRight: '0.5rem' }} />
                    Contratante (ID) <Required />
                  </Label>
                  <Input
                    id="titular_id_cliente"
                    name="titular_id_cliente"
                    value={policy.titular_id_cliente}
                    onChange={handleTitularChange}
                    placeholder="Ej: 1027"
                    inputMode="numeric"
                  />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor="titular_id_cliente">
                    <FaUserCircle style={{ marginRight: '0.5rem' }} />
                    Contratante (Nombre) <Required />
                  </Label>
                  <div style={{ marginTop: '0.35rem', fontSize: '1.25rem' }} aria-live="polite" role="status">
                    {titularStatus === 'idle' && !policy.titular_id_cliente && (
                      <span style={{ color: Palette.darkGray }}>Ingresa un ID para ver el nombre</span>
                    )}
                    {titularStatus === 'validating' && policy.titular_id_cliente && '🔄 Resolviendo…'}
                    {titularStatus === 'valid' && titularResolved && (
                      <span>✅ Contratante: <strong>{titularResolved.nombre}</strong></span>
                    )}
                    {titularStatus === 'not_found' && (
                      <span style={{ color: 'crimson' }}>❌ {titularMsg || 'ID no encontrado'}</span>
                    )}
                    {titularStatus === 'error' && (
                      <span style={{ color: 'crimson' }}>🚫 {titularMsg || 'Error al validar ID'}</span>
                    )}
                  </div>
                </FieldGroup>
              </TwoColumnRow>

              {/* Clasificación */}
              <FieldGroup>
                <TwoColumnRow>
                  <FieldGroup>
                    <Label htmlFor="prima">Prima</Label>
                    <Input
                      id="prima"
                      name="prima"
                      type="number"
                      min="0"
                      step="0.01"
                      value={policy.prima}
                      onChange={handlePolicyChange}
                      placeholder="Ej: 1250.00"
                      inputMode="decimal"
                    />
                    {errors.prima && <small style={{ color: 'crimson' }}>⚠️ {errors.prima}</small>}
                  </FieldGroup>

                  {/* Columna vacía para mantener el layout de 2 columnas */}
                  <FieldGroup />
                </TwoColumnRow>
              </FieldGroup>
              <FieldGroup>
                <TwoColumnRow>
                  <FieldGroup>
                    <Label>Categoria</Label>
                    <FullWidthSelect
                      name="categoria_poliza"
                      value={policy.categoria_poliza}
                      onChange={handleCategoria}
                    >
                      <option value="">-- Categoría --</option>
                      {TOP_LEVEL.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </FullWidthSelect>
                  </FieldGroup>

                  <FieldGroup>
                    <Label>Subcategoría / Detalle</Label>
                    {policy.categoria_poliza && Array.isArray(POLIZA_MENU[policy.categoria_poliza])
                      ? POLIZA_MENU[policy.categoria_poliza].length > 0 ? (
                        <FullWidthSelect
                          name="subcategoria_poliza"
                          value={policy.subcategoria_poliza}
                          onChange={handleSubcategoria}
                        >
                          <option value="">-- Sub-categoría --</option>
                          {POLIZA_MENU[policy.categoria_poliza].map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                          ))}
                        </FullWidthSelect>
                      ) : MANUAL_SUBCATS.includes(policy.categoria_poliza) && (
                        <Input
                          name="subcategoria_poliza"
                          value={policy.subcategoria_poliza}
                          onChange={handleSubcategoria}
                          placeholder="Especifica la subcategoría"
                          style={{ marginTop: '0.75rem' }}
                        />
                      )
                      : policy.categoria_poliza === 'Daños' && (
                        <>
                          <FullWidthSelect
                            name="subcategoria_poliza"
                            value={policy.subcategoria_poliza}
                            onChange={handleSubcategoria}
                          >
                            <option value="">-- Personal / Pyme --</option>
                            {Object.keys(POLIZA_MENU.Daños).map(sub => (
                              <option key={sub} value={sub}>{sub}</option>
                            ))}
                          </FullWidthSelect>

                          {policy.subcategoria_poliza && (
                            <FullWidthSelect
                              name="detalle_poliza"
                              value={policy.detalle_poliza}
                              onChange={handlePolicyChange}
                              style={{ marginTop: '0.75rem' }}
                            >
                              <option value="">-- Detalle --</option>
                              {POLIZA_MENU.Daños[policy.subcategoria_poliza].map(det => (
                                <option key={det} value={det}>{det}</option>
                              ))}
                            </FullWidthSelect>
                          )}
                        </>
                      )}
                  </FieldGroup>
                </TwoColumnRow>
              </FieldGroup>

              {/* Fechas */}
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="fecha_inicio_poliza">
                    <FaCalendarAlt style={{ marginRight: '0.5rem' }} />
                    Inicio
                  </Label>
                  <Input
                    id="fecha_inicio_poliza"
                    type="date"
                    name="fecha_inicio_poliza"
                    value={policy.fecha_inicio_poliza}
                    onChange={handlePolicyChange}
                  />
                </FieldGroup>

                <FieldGroup>
                  <Label htmlFor="fecha_termino_poliza">
                    <FaCalendarAlt style={{ marginRight: '0.5rem' }} />
                    Término
                  </Label>
                  <Input
                    id="fecha_termino_poliza"
                    type="date"
                    name="fecha_termino_poliza"
                    value={policy.fecha_termino_poliza}
                    onChange={handlePolicyChange}
                  />
                  {errors.fechas && <small style={{ color: 'crimson' }}>⚠️ {errors.fechas}</small>}
                </FieldGroup>
              </TwoColumnRow>
            </FieldGroup>
            <FieldGroup>
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="forma_pago">Forma de pago</Label>
                  <Input
                    id="forma_pago"
                    name="forma_pago"
                    value={policy.forma_pago}
                    onChange={handlePolicyChange}
                    placeholder="Ej: Tarjeta, Transferencia, Domiciliación..."
                  />
                </FieldGroup>

                <FieldGroup>
                  <Label htmlFor="periodicidad_pago">Periodicidad</Label>
                  <Select
                    id="periodicidad_pago"
                    name="periodicidad_pago"
                    value={policy.periodicidad_pago}
                    onChange={handlePolicyChange}
                  >
                    <option value="">-- Selecciona --</option>
                    {PERIODICIDADES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </Select>
                </FieldGroup>
              </TwoColumnRow>
            </FieldGroup> 
            <FieldGroup>
              <Label htmlFor="notas">
                <FaTags style={{ marginRight: '0.5rem' }} />
                Notas 
              </Label>
              <TextArea
                id="notas"
                name="notas"
                value={policy.notas}
                onChange={e => {
                  const v = e.target.value.slice(0, 2500);
                  setPolicy(prev => ({ ...prev, notas: v }));
                }}
                placeholder="Observaciones, alcance, aclaraciones..."
                rows={3}
              />
              <small style={{ color: '#666' }}>
                {policy.notas.length}/2500
              </small>
            </FieldGroup>

            <FieldGroup>
              <Label htmlFor="notas_participantes">
                <FaUsers style={{ marginRight: '0.5rem' }} />
                Notas participantes
              </Label>
              <TextArea
                id="notas_participantes"
                name="notas_participantes"
                value={policy.notas_participantes}
                onChange={e => {
                  const v = e.target.value.slice(0, 2500);
                  setPolicy(prev => ({ ...prev, notas_participantes: v }));
                }}
                placeholder="Observaciones sobre participantes..."
                rows={3}
              />
              <small style={{ color: '#666' }}>
                {policy.notas_participantes.length}/2500
              </small>
            </FieldGroup>
         
            {/* ───────────────────────────── Asegurados ───────────────────────────── */}
            <FieldGroup>
              <Label>
                🧍‍♀️🧍‍♂️ Asegurados
              </Label>
              <TwoColumnRow style={{ alignItems: 'flex-start' }}>
                <FieldGroup>
                  <Label htmlFor="aseguradoInput">ID de cliente</Label>
                  <Input
                    id="aseguradoInput"
                    value={aseguradoInput}
                    onChange={e => setAseguradoInput(e.target.value.replace(/\D+/g, ''))}
                    placeholder="Ej: 2045"
                    inputMode="numeric"
                  />
                  <div style={{ marginTop: '0.35rem', fontSize: '1.05rem' }} aria-live="polite" role="status">
                    {asegStatus === 'idle' && !aseguradoInput && (
                      <span style={{ color: Palette.darkGray }}>Ingresa un ID para ver el nombre</span>
                    )}
                    {asegStatus === 'validating' && aseguradoInput && '🔄 Resolviendo…'}
                    {asegStatus === 'valid' && asegResolved && (
                      <span>✅ Asegurado: <strong>{asegResolved.nombre}</strong></span>
                    )}
                    {asegStatus === 'not_found' && (
                      <span style={{ color: 'crimson' }}>❌ {asegMsg || 'ID no encontrado'}</span>
                    )}
                    {asegStatus === 'error' && (
                      <span style={{ color: 'crimson' }}>🚫 {asegMsg || 'Error al validar ID'}</span>
                    )}
                  </div>
                </FieldGroup>
                <FieldGroup>
                  <Label style={{ opacity: 0 }}>Agregar</Label>
                  <SubmitButton
                    type="button"
                    onClick={addAsegurado}
                    disabled={!canAddAsegurado}
                    title="Agregar asegurado"
                    style={{ width: '100%' }}
                  >
                    <FaPlusCircle style={{ marginRight: '0.5rem' }} />
                    Agregar asegurado
                  </SubmitButton>
                </FieldGroup>
              </TwoColumnRow>

              {errors.asegurados && <small style={{ color: 'crimson' }}>⚠️ {errors.asegurados}</small>}

              {/* Listado */}
              {asegurados.length > 0 && (
                <div style={{ marginTop: '0.75rem' }}>
                  {asegurados.map(a => {
                      const isTitular = Number(policy.titular_id_cliente) === a.cliente_id;

                    // 👇 Agrega esta línea AQUÍ
                    const displayName = a.nombre ?? clientCache[a.cliente_id]?.nombre ?? `ID ${a.cliente_id}`;

                    return (
                      <div
                        key={a.cliente_id}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr auto',
                          gap: '0.5rem',
                          alignItems: 'center',
                          border: `1px solid ${Palette.darkGray}`,
                          borderRadius: 4,
                          padding: '0.5rem 0.75rem',
                          background: '#fff',
                          marginBottom: '0.5rem'
                        }}
                      >
                        <div>
                          {/* 👇 Reemplaza esto:
                              <strong>{a.nombre || `ID ${a.cliente_id}`}</strong>
                            por esto: */}
                          <strong style={{ color: Palette.black }}>{displayName}</strong>
                          {isTitular && (
                          <span style={{ marginLeft: 8, color: Palette.cyan, fontWeight: 700 }}>
                            • Contratante
                          </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => removeAsegurado(a.cliente_id)}
                          style={{
                            background: 'transparent',
                            border: `1px solid ${Palette.darkGray}`,
                            borderRadius: 4,
                            padding: '0.25rem 0.5rem',
                            cursor: 'pointer'
                          }}
                          title="Quitar"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </FieldGroup>

            {/* ───────────────────────────── Beneficiarios ───────────────────────────── */}
            <FieldGroup>
              <Label>🎯 Beneficiarios</Label>
              <TwoColumnRow style={{ alignItems: 'flex-start' }}>
                <FieldGroup>
                  <Label htmlFor="benefInputId">ID de cliente</Label>
                  <Input
                    id="benefInputId"
                    value={benefInputId}
                    onChange={e => setBenefInputId(e.target.value.replace(/\D+/g, ''))}
                    placeholder="Ej: 2077"
                    inputMode="numeric"
                  />
                  <div style={{ marginTop: '0.35rem', fontSize: '1.05rem' }} aria-live="polite" role="status">
                    {benefStatus === 'idle' && !benefInputId && (
                      <span style={{ color: Palette.darkGray }}>Ingresa un ID para ver el nombre</span>
                    )}
                    {benefStatus === 'validating' && benefInputId && '🔄 Resolviendo…'}
                    {benefStatus === 'valid' && benefResolved && (
                      <span>✅ Beneficiario: <strong>{benefResolved.nombre}</strong></span>
                    )}
                    {benefStatus === 'not_found' && (
                      <span style={{ color: 'crimson' }}>❌ {benefMsg || 'ID no encontrado'}</span>
                    )}
                    {benefStatus === 'error' && (
                      <span style={{ color: 'crimson' }}>🚫 {benefMsg || 'Error al validar ID'}</span>
                    )}
                  </div>
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor="benefInputPct">Porcentaje</Label>
                  <Input
                    id="benefInputPct"
                    value={benefInputPct}
                    onChange={e => setBenefInputPct(e.target.value)}
                    placeholder="Ej: 50"
                    inputMode="decimal"
                  />
                </FieldGroup>
              </TwoColumnRow>
              <div style={{ marginTop: '0.5rem' }}>
                <SubmitButton
                  type="button"
                  onClick={addBeneficiario}
                  disabled={!canAddBeneficiario}
                  title="Agregar beneficiario"
                  style={{ width: '100%' }}
                >
                  <FaPlusCircle style={{ marginRight: '0.5rem' }} />
                  Agregar beneficiario
                </SubmitButton>
              </div>

              {errors.beneficiarios && <small style={{ color: 'crimson' }}>⚠️ {errors.beneficiarios}</small>}

              {/* Listado */}
              {beneficiarios.length > 0 && (
                <div style={{ marginTop: '0.75rem' }}>
                  {beneficiarios.map(b => {
                      const isTitular = Number(policy.titular_id_cliente) === b.cliente_id;

                    // 👇 AQUÍ:
                    const displayName = b.nombre ?? clientCache[b.cliente_id]?.nombre ?? `ID ${b.cliente_id}`;

                    return (
                      <div
                        key={b.cliente_id}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 140px auto',
                          gap: '0.5rem',
                          alignItems: 'center',
                          border: `1px solid ${Palette.darkGray}`,
                          borderRadius: 4,
                          padding: '0.5rem 0.75rem',
                          background: '#fff',
                          marginBottom: '0.5rem'
                        }}
                      >
                        <div>
                          <strong style={{ color: Palette.black }}>{displayName}</strong>
                          {isTitular && (
                          <span style={{ marginLeft: 8, color: Palette.cyan, fontWeight: 700 }}>
                            • Contratante
                          </span>
                          )}
                        </div>

                        <Input
                          value={b.porcentaje}
                          onChange={e => updateBeneficiarioPct(b.cliente_id, e.target.value)}
                          placeholder="%"
                          inputMode="decimal"
                        />

                        <button
                          type="button"
                          onClick={() => removeBeneficiario(b.cliente_id)}
                          style={{
                            background: 'transparent',
                            border: `1px solid ${Palette.darkGray}`,
                            borderRadius: 4,
                            padding: '0.25rem 0.5rem',
                            cursor: 'pointer'
                          }}
                          title="Quitar"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    );

                  })}
                  {/* ... */}
                </div>
              )}
            </FieldGroup>

            {/* ───────────────────────────── Botonera ───────────────────────────── */}
            <ButtonRow>
              <CancelButton type="button" onClick={handleCancelAll}>Limpiar</CancelButton>
              <SubmitButton type="submit" disabled={savingAll}>
                {savingAll ? 'Guardando…' : 'Guardar todo 💾'}
              </SubmitButton>
            </ButtonRow>
          </Form>
        </FormCard>
      </AddContainer>
    </>
  );
};

export default AddContract;
