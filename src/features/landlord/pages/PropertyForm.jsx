import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Upload, X, Building2,
  LayoutGrid, House, Inbox, Wrench, Star, Loader2,
} from 'lucide-react';
import Sidebar from '../../../components/layout/Sidebar';
import { propertyApi } from '../../../api/propertyApi';
import { useLandlordSidebar } from '../hooks/useLandlordSidebar';

const EMPTY_FORM = {
  title: '',
  description: '',
  address: '',
  city: '',
  country: '',
  pricePerNight: '',
  bedrooms: 1,
  bathrooms: 1,
  maxGuests: 1,
  isAvailable: true,
  landlordId: null,
};

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-xs font-semibold text-primary mb-1">
      {label} {required && <span className="text-accent">*</span>}
    </label>
    {children}
  </div>
);

const inputCls =
  'w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-primary placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition';

const NoPhotoThumb = () => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-linear-to-br from-primary to-slate-700">
    <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center">
      <Building2 className="w-4 h-4 text-accent" />
    </div>
  </div>
);

const PropertyForm = () => {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const sidebar = useLandlordSidebar();
  const { landlordId } = sidebar;
  const [form, setForm] = useState({ ...EMPTY_FORM, landlordId });
  const [pendingPhotos, setPendingPhotos] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [thumbErrors, setThumbErrors] = useState(new Set());
  const [serverError, setServerError] = useState(null);

  /* ── Queries ────────────────────────────────────────────── */
  const { data: propData, isLoading: propLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: () => propertyApi.getById(id).then((r) => r.data ?? null),
    enabled: !isNew && !!id,
  });

  const { data: photosRes } = useQuery({
    queryKey: ['photos', id],
    queryFn: () => propertyApi.getPhotos(id).then((r) => r.data ?? []),
    enabled: !isNew && !!id,
  });

  useEffect(() => {
    if (propData) {
      setForm({
        title: propData.title ?? '',
        description: propData.description ?? '',
        address: propData.address ?? '',
        city: propData.city ?? '',
        country: propData.country ?? '',
        pricePerNight: propData.pricePerNight ?? '',
        bedrooms: propData.bedrooms ?? 1,
        bathrooms: propData.bathrooms ?? 1,
        maxGuests: propData.maxGuests ?? 1,
        isAvailable: propData.isAvailable ?? true,
        landlordId,
      });
    }
  }, [propData, landlordId]);

  useEffect(() => {
    if (photosRes) setExistingPhotos(photosRes);
  }, [photosRes]);

  /* ── Mutations ──────────────────────────────────────────── */
  const uploadPhotos = async (propertyId, files) => {
    for (let i = 0; i < files.length; i++) {
      const isPrimary = existingPhotos.length === 0 && i === 0;
      await propertyApi.uploadPhoto(propertyId, files[i], isPrimary);
    }
  };

  const createMutation = useMutation({
    mutationFn: (data) => propertyApi.create(data),
    onSuccess: async (res) => {
      const newId = res.data?.id;
      if (newId && pendingPhotos.length > 0) {
        setUploadStatus('Subiendo fotos...');
        await uploadPhotos(newId, pendingPhotos);
      }
      queryClient.invalidateQueries({ queryKey: ['properties', 'landlord', landlordId] });
      navigate('/landlord/properties');
    },
    onError: (err) => setServerError(err?.message ?? 'Error al crear la propiedad'),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => propertyApi.update(id, data),
    onSuccess: async () => {
      if (pendingPhotos.length > 0) {
        setUploadStatus('Subiendo fotos...');
        await uploadPhotos(id, pendingPhotos);
      }
      queryClient.invalidateQueries({ queryKey: ['properties', 'landlord', landlordId] });
      queryClient.invalidateQueries({ queryKey: ['photos', id] });
      navigate('/landlord/properties');
    },
    onError: (err) => setServerError(err?.message ?? 'Error al guardar los cambios'),
  });

  const deletePhotoMutation = useMutation({
    mutationFn: (photoId) => propertyApi.deletePhoto(photoId),
    onSuccess: (_, photoId) => {
      setExistingPhotos((prev) => prev.filter((p) => p.id !== photoId));
      queryClient.invalidateQueries({ queryKey: ['photos', id] });
    },
  });

  /* ── Handlers ───────────────────────────────────────────── */
  const handleField = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleToggle = () => setForm((prev) => ({ ...prev, isAvailable: !prev.isAvailable }));

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    setPendingPhotos((prev) => [...prev, ...files]);
    e.target.value = '';
  };

  const removePending = (i) => setPendingPhotos((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = (e) => {
    e.preventDefault();
    setServerError(null);
    const data = {
      ...form,
      pricePerNight: parseFloat(form.pricePerNight),
      bedrooms: parseInt(form.bedrooms),
      bathrooms: parseInt(form.bathrooms),
      maxGuests: parseInt(form.maxGuests),
    };
    if (isNew) createMutation.mutate(data);
    else updateMutation.mutate(data);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  /* ── Sidebar ────────────────────────────────────────────── */
  if (!isNew && propLoading) {
    return (
      <div className="bg-bg-main min-h-screen">
        <Sidebar items={sidebar.items} role="PROPIETARIO" isCollapsed={sidebar.isCollapsed} onToggle={() => sidebar.setIsCollapsed(!sidebar.isCollapsed)} />
        <main className={sidebar.mainClass(sidebar.isCollapsed)}>
          <div className="animate-pulse max-w-5xl space-y-5">
            <div className="h-5 w-28 bg-slate-100 rounded" />
            <div className="h-9 w-64 bg-slate-100 rounded" />
            <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
              <div className="space-y-5">
                <div className="h-52 bg-white rounded-xl border border-slate-100" />
                <div className="h-40 bg-white rounded-xl border border-slate-100" />
                <div className="h-44 bg-white rounded-xl border border-slate-100" />
              </div>
              <div className="space-y-5">
                <div className="h-28 bg-white rounded-xl border border-slate-100" />
                <div className="h-64 bg-white rounded-xl border border-slate-100" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className="bg-bg-main min-h-screen">
      <Sidebar
        items={sidebar.items}
        role="PROPIETARIO"
        isCollapsed={sidebar.isCollapsed}
        onToggle={() => sidebar.setIsCollapsed(!sidebar.isCollapsed)}
      />

      <main className={sidebar.mainClass(sidebar.isCollapsed)}>
        <div className="max-w-5xl space-y-6">

          {/* Header */}
          <div>
            <Link
              to="/landlord/properties"
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors -ml-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Mis propiedades
            </Link>
            <div className="mt-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">Catálogo</span>
              <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-primary">
                {isNew ? 'Nueva' : 'Editar'}{' '}
                <span className="font-serif italic font-normal text-accent">propiedad</span>
              </h1>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_340px] items-start">

            {/* ── Left column ─────────────────────────────── */}
            <div className="space-y-5">

              {/* Basic info */}
              <section className="rounded-xl bg-white border border-slate-100 shadow-sm p-6 space-y-4">
                <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Información básica</h2>

                <Field label="Título" required>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleField}
                    required
                    className={inputCls}
                    placeholder="Ej. Apartamento moderno en el centro"
                  />
                </Field>

                <Field label="Descripción">
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleField}
                    rows={4}
                    className={`${inputCls} resize-none`}
                    placeholder="Describe tu propiedad: espacios, entorno, servicios cercanos..."
                  />
                </Field>
              </section>

              {/* Location */}
              <section className="rounded-xl bg-white border border-slate-100 shadow-sm p-6 space-y-4">
                <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ubicación</h2>

                <Field label="Dirección">
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleField}
                    className={inputCls}
                    placeholder="Calle, número, colonia..."
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Ciudad" required>
                    <input
                      name="city"
                      value={form.city}
                      onChange={handleField}
                      required
                      className={inputCls}
                      placeholder="San Salvador"
                    />
                  </Field>
                  <Field label="País" required>
                    <input
                      name="country"
                      value={form.country}
                      onChange={handleField}
                      required
                      className={inputCls}
                      placeholder="El Salvador"
                    />
                  </Field>
                </div>
              </section>

              {/* Details */}
              <section className="rounded-xl bg-white border border-slate-100 shadow-sm p-6 space-y-4">
                <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Detalles</h2>

                <Field label="Precio por noche ($)" required>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">$</span>
                    <input
                      name="pricePerNight"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.pricePerNight}
                      onChange={handleField}
                      required
                      className={`${inputCls} pl-7`}
                      placeholder="50.00"
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-slate-400">
                    ≈ ${form.pricePerNight ? Math.round(parseFloat(form.pricePerNight) * 30).toLocaleString() : '0'} / mes
                  </p>
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Field label="Habitaciones" required>
                    <input
                      name="bedrooms"
                      type="number"
                      min="1"
                      max="20"
                      value={form.bedrooms}
                      onChange={handleField}
                      required
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Baños" required>
                    <input
                      name="bathrooms"
                      type="number"
                      min="1"
                      max="20"
                      value={form.bathrooms}
                      onChange={handleField}
                      required
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Huéspedes máx." required>
                    <input
                      name="maxGuests"
                      type="number"
                      min="1"
                      max="50"
                      value={form.maxGuests}
                      onChange={handleField}
                      required
                      className={inputCls}
                    />
                  </Field>
                </div>
              </section>
            </div>

            {/* ── Right column ────────────────────────────── */}
            <div className="space-y-5 lg:sticky lg:top-6">

              {/* Availability toggle */}
              <section className="rounded-xl bg-white border border-slate-100 shadow-sm p-6">
                <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">Publicación</h2>
                <button
                  type="button"
                  onClick={handleToggle}
                  className="flex items-center gap-3 w-full text-left"
                >
                  <div
                    className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${
                      form.isAvailable ? 'bg-green-400' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                        form.isAvailable ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${form.isAvailable ? 'text-green-600' : 'text-slate-400'}`}>
                      {form.isAvailable ? 'Publicada · Activa' : 'Sin publicar · Inactiva'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {form.isAvailable
                        ? 'Visible para los inquilinos'
                        : 'No visible para los inquilinos'}
                    </p>
                  </div>
                </button>
              </section>

              {/* Photos */}
              <section className="rounded-xl bg-white border border-slate-100 shadow-sm p-6 space-y-4">
                <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fotos</h2>

                {/* Existing photos grid */}
                {existingPhotos.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {existingPhotos.map((p) => (
                      <div key={p.id} className="relative group aspect-video rounded-lg overflow-hidden bg-slate-100">
                        {thumbErrors.has(p.s3Url) ? (
                          <NoPhotoThumb />
                        ) : (
                          <img
                            src={p.s3Url}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={() => setThumbErrors((prev) => new Set([...prev, p.s3Url]))}
                          />
                        )}
                        {p.isPrimary && (
                          <span className="absolute top-1 left-1 rounded-full bg-accent/90 px-1.5 py-0.5 text-[9px] font-bold text-primary uppercase tracking-wide">
                            Principal
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => deletePhotoMutation.mutate(p.id)}
                          disabled={deletePhotoMutation.isPending}
                          className="absolute top-1 right-1 h-6 w-6 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-50"
                        >
                          <X className="h-3.5 w-3.5 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pending (queued) photos */}
                {pendingPhotos.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">En cola para subir</p>
                    {pendingPhotos.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-md border border-dashed border-slate-200 bg-slate-50/50 px-3 py-2"
                      >
                        <span className="text-xs text-slate-600 truncate max-w-47.5">{f.name}</span>
                        <button type="button" onClick={() => removePending(i)} className="ml-2 shrink-0">
                          <X className="h-3.5 w-3.5 text-slate-300 hover:text-red-400 transition" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload drop zone */}
                <label className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-200 p-6 cursor-pointer hover:border-accent/40 hover:bg-accent/5 transition group">
                  <Upload className="h-5 w-5 text-slate-300 group-hover:text-accent transition" />
                  <span className="text-xs text-slate-400 group-hover:text-accent transition font-medium">
                    Seleccionar fotos
                  </span>
                  <span className="text-[10px] text-slate-300">JPG, PNG, WEBP</span>
                  <input type="file" accept="image/*" multiple onChange={handleFiles} className="sr-only" />
                </label>

                {(existingPhotos.length === 0 && pendingPhotos.length === 0) && (
                  <p className="text-[10px] text-slate-400 -mt-1">
                    La primera foto seleccionada será la imagen principal.
                  </p>
                )}
              </section>

              {/* Error banner */}
              {serverError && (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-2">
                  <X className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-700">{serverError}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/landlord/properties"
                  className="flex-1 h-10 rounded-md border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition flex items-center justify-center"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 h-10 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {uploadStatus || (isNew ? 'Creando...' : 'Guardando...')}
                    </>
                  ) : (
                    isNew ? 'Publicar propiedad' : 'Guardar cambios'
                  )}
                </button>
              </div>

            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default PropertyForm;
