// components/CompanyParticipantsHelp.tsx
export default function CompanyParticipantsHelp(){
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
      <div className="font-medium text-slate-900 mb-1">¿Cómo funciona?</div>
      <ul className="list-disc pl-5 space-y-1">
        <li>Elige el curso y agrega a tus participantes (nombre, correo, RUT y teléfono opcional).</li>
        <li>Guarda el borrador: se mantiene en este navegador automáticamente.</li>
        <li>“Continuar a compra” te llevará a la página del curso con los participantes adjuntos en la URL.</li>
        <li>Más adelante, podremos consumir esos datos en el backend para generar la orden y las inscripciones en bloque.</li>
      </ul>
    </div>
  );
}
