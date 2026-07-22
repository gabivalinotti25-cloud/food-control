import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import api from "../services/api";

const DIAS_SEMANA = [
  { value: 1, nombre: "Lunes" },
  { value: 2, nombre: "Martes" },
  { value: 3, nombre: "Miércoles" },
  { value: 4, nombre: "Jueves" },
  { value: 5, nombre: "Viernes" },
  { value: 6, nombre: "Sábado" },
];

export default function ConfiguracionMenu() {
  const [configuraciones, setConfiguraciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarConfiguraciones();
  }, []);

  async function cargarConfiguraciones() {
    try {
      const response = await api.get("/configuracion-menu");
      setConfiguraciones(response.data);
    } catch (error) {
      console.error("Error cargando configuraciones:", error);
    } finally {
      setLoading(false);
    }
  }

  async function inicializarConfiguraciones() {
    try {
      await api.get("/configuracion-menu/inicializar");
      cargarConfiguraciones();
      alert("Configuraciones inicializadas correctamente");
    } catch (error) {
      console.error("Error inicializando:", error);
      alert("Error al inicializar configuraciones");
    }
  }

  async function actualizarConfiguracion(id, data) {
    try {
      await api.put(`/configuracion-menu/${id}`, data);
      cargarConfiguraciones();
      alert("Configuración actualizada");
    } catch (error) {
      console.error("Error actualizando:", error);
      alert("Error al actualizar configuración");
    }
  }

  async function crearConfiguracion(diaSemana) {
    try {
      await api.post("/configuracion-menu", {
        diaSemana,
        productosFijos: true,
        cantidadMaxEspeciales: 2,
      });
      cargarConfiguraciones();
    } catch (error) {
      console.error("Error creando:", error);
      alert("Error al crear configuración");
    }
  }

  async function eliminarConfiguracion(id) {
    if (!confirm("¿Eliminar esta configuración?")) return;
    try {
      await api.delete(`/configuracion-menu/${id}`);
      cargarConfiguraciones();
    } catch (error) {
      console.error("Error eliminando:", error);
      alert("Error al eliminar configuración");
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Cargando...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Configuración de Menú</h1>
        <p className="text-gray-500 mt-2">
          Configura el menú para cada día de la semana
        </p>
      </div>

      <div className="mb-6">
        <button
          onClick={inicializarConfiguraciones}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Inicializar Configuraciones por Defecto
        </button>
      </div>

      <div className="space-y-4">
        {DIAS_SEMANA.map((dia) => {
          const config = configuraciones.find((c) => c.diaSemana === dia.value);

          return (
            <div key={dia.value} className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">{dia.nombre}</h3>
                {config ? (
                  <button
                    onClick={() => eliminarConfiguracion(config.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                ) : (
                  <button
                    onClick={() => crearConfiguracion(dia.value)}
                    className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700"
                  >
                    Crear
                  </button>
                )}
              </div>

              {config ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Productos Fijos</p>
                      <p className="text-sm text-gray-500">
                        Incluir productos fijos en el menú
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        actualizarConfiguracion(config.id, {
                          ...config,
                          productosFijos: !config.productosFijos,
                        })
                      }
                      className={`px-4 py-2 rounded-lg ${
                        config.productosFijos
                          ? "bg-green-600 text-white"
                          : "bg-gray-300 text-gray-700"
                      }`}
                    >
                      {config.productosFijos ? "Activado" : "Desactivado"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Máx. Platos Especiales</p>
                      <p className="text-sm text-gray-500">
                        Cantidad de platos especiales permitidos
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          actualizarConfiguracion(config.id, {
                            ...config,
                            cantidadMaxEspeciales: Math.max(
                              0,
                              config.cantidadMaxEspeciales - 1
                            ),
                          })
                        }
                        className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
                      >
                        -
                      </button>
                      <span className="font-bold text-lg w-8 text-center">
                        {config.cantidadMaxEspeciales}
                      </span>
                      <button
                        onClick={() =>
                          actualizarConfiguracion(config.id, {
                            ...config,
                            cantidadMaxEspeciales:
                              config.cantidadMaxEspeciales + 1,
                          })
                        }
                        className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Estado</p>
                      <p className="text-sm text-gray-500">
                        Configuración activa/inactiva
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        actualizarConfiguracion(config.id, {
                          ...config,
                          activo: !config.activo,
                        })
                      }
                      className={`px-4 py-2 rounded-lg ${
                        config.activo
                          ? "bg-green-600 text-white"
                          : "bg-gray-300 text-gray-700"
                      }`}
                    >
                      {config.activo ? "Activo" : "Inactivo"}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No hay configuración para este día
                </p>
              )}
            </div>
          );
        })}
      </div>
    </MainLayout>
  );
}
