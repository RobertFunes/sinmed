// add.jsx (actualizado con nuevos campos y sección colapsable)
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useBeforeUnload, useBlocker } from 'react-router-dom';
import Header from '../components/Header';
import { AddContainer, FormCard, Title, Form, ButtonRow, SubmitButton } from './Add.styles';
import { url } from '../helpers/url';
import { SISTEMAS_OPCIONES, INSPECCION_OPCIONES } from '../helpers/add/catalogos';
import { initialState } from '../helpers/add/initialState';
import { buildNestedPayload } from '../helpers/add/buildPayload';
import ConfirmModal from '../components/ConfirmModal';

// iconos: se usan dentro de las secciones hijas, no aquí
import DatosPersonalesSection from '../components/add/DatosPersonalesSection';
import AntecedentesFamiliaresSection from '../components/add/AntecedentesFamiliaresSection';
import AntecedentesPersonalesSection from '../components/add/AntecedentesPersonalesSection';
import GinecoObstetricosSection from '../components/add/GinecoObstetricosSection';
import AntecedentesPatologicosSection from '../components/add/AntecedentesPatologicosSection';
import ExploracionFisicaSection from '../components/add/ExploracionFisicaSection';
import ConsultasSection from '../components/add/ConsultasSection';




const todayISO = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().split('T')[0];
};

const buildInitialForm = () => ({
  ...initialState,
  fecha_consulta: todayISO(),
});

const Add = () => {
  const navigate = useNavigate();
  const initialFormRef = useRef(null);
  const initialPayloadStringRef = useRef('');

  const computePamFromPressure = useCallback((value) => {
    const str = String(value ?? '').trim();
    const slashIndex = str.indexOf('/');
    if (slashIndex < 0) return '';

    const leftPart = str.slice(0, slashIndex);
    const rightPart = str.slice(slashIndex + 1);

    const leftMatches = leftPart.match(/\d+(?:\.\d+)?/g) || [];
    const rightMatches = rightPart.match(/\d+(?:\.\d+)?/g) || [];
    if (leftMatches.length === 0 || rightMatches.length === 0) return '';

    const sist = parseFloat(leftMatches[leftMatches.length - 1]);
    const diast = parseFloat(rightMatches[0]);
    if (!Number.isFinite(sist) || !Number.isFinite(diast)) return '';

    const pam = ((sist - diast) / 3) + diast;
    return Number.isFinite(pam) ? pam.toFixed(2) : '';
  }, []);

  if (!initialFormRef.current) {
    const freshForm = buildInitialForm();
    initialFormRef.current = freshForm;
    const initialPayload = buildNestedPayload(freshForm);
    initialPayloadStringRef.current = JSON.stringify(initialPayload);
  }

  const [formData, setFormData] = useState(initialFormRef.current);
  const nombreRef = useRef(null);
  // Control de acordeón: solo una sección abierta a la vez
  const [openSection, setOpenSection] = useState('datos');
  const handleToggle = (key) => (e) => {
    if (e.currentTarget.open) {
      // Abrir esta sección y mantener cerradas las demás
      setOpenSection(key);
    } else {
      // Solo cerrar si es la sección actualmente activa; ignorar cierres de otras
      setOpenSection((prev) => (prev === key ? null : prev));
    }
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nuevoAntecedente, setNuevoAntecedente] = useState('');
  const [nuevoHabito, setNuevoHabito] = useState('');
  const [nuevoPatologico, setNuevoPatologico] = useState('');
  const [nuevoSistema, setNuevoSistema] = useState('');
  const [nuevoInspeccion, setNuevoInspeccion] = useState('');
  // Eliminado: nuevoDieta
  const [hasChanges, setHasChanges] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const allowNavigationRef = useRef(false);
  const consultaPamManualRef = useRef(false);
  const blocker = useBlocker(() => hasChanges && !allowNavigationRef.current);
  const blockerState = blocker.state;

  const updateSnapshot = useCallback((data, payload) => {
    initialFormRef.current = data;
    const resolvedPayload = payload ?? buildNestedPayload(data);
    initialPayloadStringRef.current = JSON.stringify(resolvedPayload);
    setHasChanges(false);
    allowNavigationRef.current = false;
  }, []);

  // Toggle exclusivo para 'alérgico': permite ninguno o sólo uno (Sí/No)
  const toggleAlergico = (valor) => (e) => {
    const checked = e.target.checked;
    setFormData(prev => ({
      ...prev,
      alergico: checked ? valor : (prev.alergico === valor ? '' : prev.alergico),
    }));
  };

  const handleChange = ({ target: { name, value } }) => {
    if (name === 'telefono_movil') {
      const digits = value.replace(/\D/g, '');
      const suffix = digits.startsWith('52') ? digits.slice(2) : digits;
      setFormData(prev => ({ ...prev, [name]: `52${suffix}` }));
      return;
    }
    if (name === 'consulta_pam') {
      consultaPamManualRef.current = value.trim() !== '';
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const currentPayloadString = JSON.stringify(buildNestedPayload(formData));
    const different = currentPayloadString !== initialPayloadStringRef.current;
    setHasChanges(prev => (prev !== different ? different : prev));
  }, [formData]);

  useBeforeUnload(
    useCallback((event) => {
      if (!hasChanges || allowNavigationRef.current) return;
      event.preventDefault();
      event.returnValue = '';
    }, [hasChanges])
  );

  useEffect(() => {
    setShowLeaveModal(blockerState === 'blocked');
  }, [blockerState]);

  // Log en tiempo real cada vez que cambia el payload
  useEffect(() => {
    const livePayload = buildNestedPayload(formData);
    console.log('[Add] Payload actualizado:', livePayload);
  }, [formData]);

  // 🧮 Auto-cálculo de IMC cuando hay peso y talla
  useEffect(() => {
    const w = parseFloat(formData.peso_actual);
    const hcm = parseFloat(formData.talla_cm);
    if (Number.isFinite(w) && w > 0 && Number.isFinite(hcm) && hcm > 0) {
      const hm = hcm / 100;
      const bmi = w / (hm * hm);
      setFormData(prev => ({ ...prev, imc: bmi.toFixed(2) }));
    } else {
      setFormData(prev => ({ ...prev, imc: '' }));
    }
  }, [formData.peso_actual, formData.talla_cm]);

  useEffect(() => {
    const pamValue = computePamFromPressure(formData.ta_mmhg);
    setFormData((prev) => (prev.pam === pamValue ? prev : { ...prev, pam: pamValue }));
  }, [computePamFromPressure, formData.ta_mmhg]);

  useEffect(() => {
    if (consultaPamManualRef.current) return;
    const pamValue = computePamFromPressure(formData.presion);
    setFormData((prev) => (prev.consulta_pam === pamValue ? prev : { ...prev, consulta_pam: pamValue }));
  }, [computePamFromPressure, formData.presion]);

  const handleSubmit = async e => {
    e.preventDefault();

    // Validación manual para evitar el error de controles no enfocables cuando <details> está cerrado
    if (!formData.nombre.trim()) {
      setOpenSection('datos');
      setTimeout(() => {
        if (nombreRef.current) nombreRef.current.focus();
      }, 0);
      alert('El nombre es obligatorio.');
      return;
    }

    setIsSubmitting(true);

    // Construye objeto anidado y registra exactamente ese objeto
    const payload = buildNestedPayload(formData);
    console.log(payload);

    try {
      const res = await fetch(`${url}/api/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        let data;
        try {
          data = await res.json();
        } catch {
          data = null;
        }
        alert('Perfil agregado correctamente');
        if (data && data.id_perfil) {
          updateSnapshot(formData, payload);
          allowNavigationRef.current = true;
          navigate(`/modify/${data.id_perfil}`);
        } else {
          const fresh = buildInitialForm();
          updateSnapshot(fresh);
          setFormData(fresh);
        }
      } else {
        alert('Ocurrió un error al agregar el perfil');
      }
    } catch (err) {
      console.error(err);
      alert('Error de red al intentar agregar el perfil');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addAntecedente = () => {
    if (!nuevoAntecedente) return;
    setFormData(prev => ({
      ...prev,
      antecedentes_familiares: [
        ...prev.antecedentes_familiares,
        nuevoAntecedente === 'Otras'
          ? { nombre: '', descripcion: '', esOtro: true }
          : { nombre: nuevoAntecedente, descripcion: '' },
      ],
    }));
    setNuevoAntecedente('');
  };
  const removeAntecedenteAt = (idx) => {
    setFormData(prev => ({
      ...prev,
      antecedentes_familiares: prev.antecedentes_familiares.filter((_, i) => i !== idx),
    }));
  };
  const updateAntecedenteField = (idx, field, value) => {
    setFormData(prev => ({
      ...prev,
      antecedentes_familiares: prev.antecedentes_familiares.map((item, i) => i === idx ? { ...item, [field]: value } : item),
    }));
  };

  // ---- Antecedentes personales: hábitos ----
  const addHabito = () => {
    if (!nuevoHabito) return;
    const base = { tipo: nuevoHabito, campos: {} };
    if (nuevoHabito === 'Alcoholismo') {
      base.campos = { bebidas_por_dia: '', tiempo_activo_alc: '', tiempo_inactivo_alc: '' };
    }
    if (nuevoHabito === 'Tabaquismo') {
      base.campos = { cigarrillos_por_dia: '', tiempo_activo_tab: '', tiempo_inactivo_tab: '' };
    }
    if (nuevoHabito === 'Toxicomanías') {
      base.campos = { tipo_toxicomania: '', tiempo_activo_tox: '', tiempo_inactivo_tox: '' };
    }
    setFormData(prev => ({
      ...prev,
      antecedentes_personales_habitos: [...prev.antecedentes_personales_habitos, base],
    }));
    setNuevoHabito('');
  };
  const removeHabitoAt = (idx) => {
    setFormData(prev => ({
      ...prev,
      antecedentes_personales_habitos: prev.antecedentes_personales_habitos.filter((_, i) => i !== idx),
    }));
  };
  const updateHabitoCampo = (idx, campo, valor) => {
    setFormData(prev => ({
      ...prev,
      antecedentes_personales_habitos: prev.antecedentes_personales_habitos.map((h, i) => i === idx ? { ...h, campos: { ...h.campos, [campo]: valor } } : h),
    }));
  };

  // Eliminado: lógica de componentes de la dieta (add/remove/update)

  // ---- Antecedentes personales patológicos ----
  const addPatologico = () => {
    if (!nuevoPatologico) return;
    setFormData(prev => ({
      ...prev,
      antecedentes_personales_patologicos: [
        ...prev.antecedentes_personales_patologicos,
        { antecedente: nuevoPatologico, descripcion: '' },
      ],
    }));
    setNuevoPatologico('');
  };
  const removePatologicoAt = (idx) => {
    setFormData(prev => ({
      ...prev,
      antecedentes_personales_patologicos: prev.antecedentes_personales_patologicos.filter((_, i) => i !== idx),
    }));
  };
  const updatePatologicoDesc = (idx, valor) => {
    setFormData(prev => ({
      ...prev,
      antecedentes_personales_patologicos: prev.antecedentes_personales_patologicos.map((p, i) => i === idx ? { ...p, descripcion: valor } : p),
    }));
  };

  // ---- Padecimiento actual e interrogatorio por aparatos y sistemas ----
  const addSistema = () => {
    if (!nuevoSistema) return;
    setFormData(prev => ({
      ...prev,
      interrogatorio_aparatos: [
        ...prev.interrogatorio_aparatos,
        { nombre: nuevoSistema, descripcion: '' },
      ],
    }));
    setNuevoSistema('');
  };
  const removeSistemaAt = (idx) => {
    setFormData(prev => ({
      ...prev,
      interrogatorio_aparatos: prev.interrogatorio_aparatos.filter((_, i) => i !== idx),
    }));
  };
  const updateSistemaDesc = (idx, valor) => {
    setFormData(prev => ({
      ...prev,
      interrogatorio_aparatos: prev.interrogatorio_aparatos.map((s, i) => i === idx ? { ...s, descripcion: valor } : s),
    }));
  };

  // ---- Consultas: personalizados (título + descripción) ----
  const addPersonalizado = () => {
    setFormData(prev => {
      const list = Array.isArray(prev.personalizados) ? prev.personalizados : [];
      if (list.length >= 10) return prev;
      return {
        ...prev,
        personalizados: [
          ...list,
          { nombre: '', descripcion: '' },
        ],
      };
    });
  };
  const removePersonalizadoAt = (idx) => {
    setFormData(prev => ({
      ...prev,
      personalizados: (prev.personalizados || []).filter((_, i) => i !== idx),
    }));
  };
  const updatePersonalizadoField = (idx, field, valor) => {
    setFormData(prev => ({
      ...prev,
      personalizados: (prev.personalizados || []).map((p, i) => i === idx ? { ...p, [field]: valor } : p),
    }));
  };

  // ---- Exploración física: inspección general ----
  const addInspeccion = () => {
    if (!nuevoInspeccion) return;
    setFormData(prev => ({
      ...prev,
      inspeccion_general: [
        ...prev.inspeccion_general,
        { nombre: nuevoInspeccion, descripcion: '' },
      ],
    }));
    setNuevoInspeccion('');
  };
  const removeInspeccionAt = (idx) => {
    setFormData(prev => ({
      ...prev,
      inspeccion_general: prev.inspeccion_general.filter((_, i) => i !== idx),
    }));
  };
  const updateInspeccionDesc = (idx, valor) => {
    setFormData(prev => ({
      ...prev,
      inspeccion_general: prev.inspeccion_general.map((s, i) => i === idx ? { ...s, descripcion: valor } : s),
    }));
  };
  // Required movido a DatosPersonalesSection

  // 👩‍⚕️ Visibilidad Gineco-Obstétricos
  // Muestra la sección solo si el género NO es "Hombre" ("", "Mujer", etc.)
  const showGineco = (formData.genero || '').trim() !== 'Hombre';

  return (
    <>
      <Header />
      <AddContainer>
        <FormCard>
          <Title>
            <span>Nueva</span> historia clínica.
          </Title>

          <Form onSubmit={handleSubmit} noValidate>
            {/* 🧍 Datos personales -> payload.datos_personales */}
            <DatosPersonalesSection
              formData={formData}
              onChange={handleChange}
              isOpen={openSection === 'datos'}
              onToggle={handleToggle('datos')}
              nombreRef={nombreRef}
            />

            {/* 👪 Antecedentes familiares -> payload.antecedentes_familiares[] */}
            <AntecedentesFamiliaresSection
              formData={formData}
              nuevoAntecedente={nuevoAntecedente}
              setNuevoAntecedente={setNuevoAntecedente}
              addAntecedente={addAntecedente}
              removeAntecedenteAt={removeAntecedenteAt}
              updateAntecedenteField={updateAntecedenteField}
              isOpen={openSection === 'familiares'}
              onToggle={handleToggle('familiares')}
            />

            {/* 🧗 Hábitos y alimentación -> payload.antecedentes_personales */}
            <AntecedentesPersonalesSection
              formData={formData}
              nuevoHabito={nuevoHabito}
              setNuevoHabito={setNuevoHabito}
              addHabito={addHabito}
              removeHabitoAt={removeHabitoAt}
              updateHabitoCampo={updateHabitoCampo}
              handleChange={handleChange}
              isOpen={openSection === 'personales'}
              onToggle={handleToggle('personales')}
            />

            {/* 👶 Gineco-Obstétricos -> payload.gineco_obstetricos (solo si no es Hombre) */}
            {showGineco && (
            <GinecoObstetricosSection
              formData={formData}
              handleChange={handleChange}
              isOpen={openSection === 'gineco'}
              onToggle={handleToggle('gineco')}
              showGineco={showGineco}
            />
            )}

            {/* 🧬 Patológicos -> payload.antecedentes_personales_patologicos[] */}
            <AntecedentesPatologicosSection
              formData={formData}
              nuevoPatologico={nuevoPatologico}
              setNuevoPatologico={setNuevoPatologico}
              addPatologico={addPatologico}
              removePatologicoAt={removePatologicoAt}
              updatePatologicoDesc={updatePatologicoDesc}
              isOpen={openSection === 'patologicos'}
              onToggle={handleToggle('patologicos')}
            />
            {/* 📅 Consultas (padecimiento + interrogatorio) -> payload.consultas */}
            <ConsultasSection
              formData={formData}
              handleChange={handleChange}
              isOpen={openSection === 'consultas'}
              onToggle={handleToggle('consultas')}
              SISTEMAS_OPCIONES={SISTEMAS_OPCIONES}
              nuevoSistema={nuevoSistema}
              setNuevoSistema={setNuevoSistema}
              addSistema={addSistema}
              removeSistemaAt={removeSistemaAt}
              updateSistemaDesc={updateSistemaDesc}
              addPersonalizado={addPersonalizado}
              removePersonalizadoAt={removePersonalizadoAt}
              updatePersonalizadoField={updatePersonalizadoField}
              toggleAlergico={toggleAlergico}
            />
            {/* 🩺 Exploración física -> payload.exploracion_fisica */}
            <ExploracionFisicaSection
              formData={formData}
              handleChange={handleChange}
              isOpen={openSection === 'exploracion'}
              onToggle={handleToggle('exploracion')}
              INSPECCION_OPCIONES={INSPECCION_OPCIONES}
              nuevoInspeccion={nuevoInspeccion}
              setNuevoInspeccion={setNuevoInspeccion}
              addInspeccion={addInspeccion}
              removeInspeccionAt={removeInspeccionAt}
              updateInspeccionDesc={updateInspeccionDesc}
            />

            

            {/* Botonera */}
            <ButtonRow>
              <SubmitButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Grabando...' : 'Grabar en base de datos'}
              </SubmitButton>
            </ButtonRow>
          </Form>
        </FormCard>
      </AddContainer>
      <ConfirmModal
        open={showLeaveModal}
        title="Cambios sin guardar"
        text="Tienes cambios sin guardar. Si sales perderás la información ingresada."
        confirmLabel="Salir sin guardar"
        onCancel={() => {
          allowNavigationRef.current = false;
          blocker.reset();
          setShowLeaveModal(false);
        }}
        onConfirm={() => {
          allowNavigationRef.current = true;
          setShowLeaveModal(false);
          blocker.proceed();
        }}
      />
    </>
  );
};

export default Add;
