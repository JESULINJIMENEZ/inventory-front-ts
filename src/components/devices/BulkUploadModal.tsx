import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { deviceService } from '../../services/deviceService';
import { useNotification } from '../../contexts/NotificationContext';
import { Upload, Download, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface UploadResult {
  message: string;
  summary: {
    total_rows: number;
    successful: number;
    failed: number;
  };
  errors?: string[];
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const { addNotification } = useNotification();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        addNotification({
          type: 'error',
          message: 'Por favor selecciona un archivo CSV válido'
        });
        return;
      }
      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      addNotification({
        type: 'error',
        message: 'Por favor selecciona un archivo CSV'
      });
      return;
    }

    setIsUploading(true);
    try {
      const result = await deviceService.bulkUpload(selectedFile);
      setUploadResult(result);
      
      if (result.summary.successful > 0) {
        addNotification({
          type: 'success',
          message: `${result.summary.successful} dispositivos cargados exitosamente`
        });
        onSuccess();
      }
      
      if (result.summary.failed > 0 && result.summary.successful === 0) {
        addNotification({
          type: 'error',
          message: `Error: No se pudo cargar ningún dispositivo`
        });
      } else if (result.summary.failed > 0) {
        addNotification({
          type: 'warning',
          message: `${result.summary.failed} dispositivos fallaron en la carga`
        });
      }
    } catch (error: any) {
      console.error('Error en carga masiva:', error);
      addNotification({
        type: 'error',
        message: error.response?.data?.error || 'Error al procesar el archivo CSV'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    setIsDownloadingTemplate(true);
    try {
      const blob = await deviceService.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'plantilla_dispositivos.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      addNotification({
        type: 'success',
        message: 'Plantilla descargada exitosamente'
      });
    } catch (error: any) {
      console.error('Error descargando plantilla:', error);
      addNotification({
        type: 'error',
        message: 'Error al descargar la plantilla'
      });
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setUploadResult(null);
    onClose();
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadResult(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Carga Masiva de Dispositivos"
      size="large"
    >
      <div className="space-y-6">
        {/* Instrucciones */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <FileText className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm">
              <h4 className="font-medium text-blue-900 mb-2">Instrucciones para la carga masiva:</h4>
              <ol className="list-decimal list-inside space-y-1 text-blue-700">
                <li>Descarga la plantilla CSV haciendo clic en "Descargar Plantilla"</li>
                <li>Completa los datos en la plantilla siguiendo el formato indicado</li>
                <li>Guarda el archivo en formato CSV con separador punto y coma (;)</li>
                <li>Sube el archivo completado usando el botón "Seleccionar Archivo"</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Descargar plantilla */}
        <div className="flex justify-center">
          <button
            onClick={handleDownloadTemplate}
            disabled={isDownloadingTemplate}
            className="inline-flex items-center px-4 py-2 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            <Download className="h-4 w-4 mr-2" />
            {isDownloadingTemplate ? 'Descargando...' : 'Descargar Plantilla CSV'}
          </button>
        </div>

        {/* Selector de archivo */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="csv-file" className="cursor-pointer">
                <span className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Seleccionar Archivo CSV
                </span>
                <input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
            {selectedFile && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-700">{selectedFile.name}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    onClick={resetUpload}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Resultado de la carga */}
        {uploadResult && (
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Resultado de la Carga</h4>
            
            {/* Resumen */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{uploadResult.summary.total_rows}</div>
                <div className="text-sm text-blue-700">Total Filas</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{uploadResult.summary.successful}</div>
                <div className="text-sm text-green-700">Exitosos</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{uploadResult.summary.failed}</div>
                <div className="text-sm text-red-700">Fallidos</div>
              </div>
            </div>

            {/* Errores */}
            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <h5 className="font-medium text-red-900 mb-2">Errores encontrados:</h5>
                    <div className="max-h-40 overflow-y-auto">
                      <ul className="text-sm text-red-700 space-y-1">
                        {uploadResult.errors.map((error, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-red-400 mr-2">•</span>
                            <span>{error}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mensaje de éxito */}
            {uploadResult.summary.successful > 0 && uploadResult.summary.failed === 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-sm text-green-700">
                    ¡Carga completada exitosamente! Todos los dispositivos han sido creados.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {uploadResult ? 'Cerrar' : 'Cancelar'}
          </button>
          {selectedFile && !uploadResult && (
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Procesando...' : 'Subir Archivo'}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
