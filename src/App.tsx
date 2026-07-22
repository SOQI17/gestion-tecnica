import React, { useState, useEffect } from 'react';
import { Layers, CalendarDays, Smartphone, Sparkles, Database, Copy, Check, ExternalLink, ShieldAlert, RefreshCw, Info, Trash2 } from 'lucide-react';
import { masterEngineers, mockClients, mockWorkOrders, mockReports } from './mockData';
import { WorkOrder, TechnicalReport, WorkOrderStatus, Engineer, Client, Equipment, Contract, Vacation, EngineerPermission, MaintenanceRegistry } from './types';
import AdminPortal from './components/AdminPortal';
import EngineerPortal from './components/EngineerPortal';
import Login from './components/Login';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, writeBatch, getDocs, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { AppUser } from './types';

const cleanUndefined = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  const clean: any = Array.isArray(obj) ? [] : {};
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined) {
      clean[key] = cleanUndefined(obj[key]);
    }
  });
  return clean;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'admin' | 'engineer'>('engineer');

  // Simple state starting from 0, connecting directly to Firestore
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [reports, setReports] = useState<TechnicalReport[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [permissions, setPermissions] = useState<EngineerPermission[]>([]);
  const [maintenanceRegistries, setMaintenanceRegistries] = useState<MaintenanceRegistry[]>([]);

  const [dbLoading, setDbLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Escuchar el estado de autenticación de Firebase
  useEffect(() => {
    if (isDemoMode) {
      setAuthLoading(false);
      return;
    }

    setAuthLoading(true);
    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as AppUser;
            setCurrentUser(userData);
            if (userData.role === 'engineer') {
              setActiveTab('engineer');
            } else {
              setActiveTab('admin');
            }
          } else {
            // Auto-crear perfil en Firestore si es nuevo
            let role: 'admin' | 'engineer' = 'engineer';
            let engineerId: string | undefined;

            const targetEmail = firebaseUser.email?.trim().toLowerCase() || '';
            if (targetEmail === 'alexis.guerra@orimec.com.ec') {
              role = 'admin';
            } else {
              const matchedEng = engineers.find(eng => eng.email.trim().toLowerCase() === targetEmail) || 
                                 masterEngineers.find(eng => eng.email.trim().toLowerCase() === targetEmail);
              if (matchedEng) {
                role = 'engineer';
                engineerId = matchedEng.id;
              }
            }

            const newProfile: AppUser = {
              uid: firebaseUser.uid,
              email: targetEmail,
              role,
              ...(role === 'engineer' && { engineerId })
            };

            await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
            setCurrentUser(newProfile);
            if (role === 'engineer') {
              setActiveTab('engineer');
            } else {
              setActiveTab('admin');
            }
          }
          setDbError(null);
        } catch (e: any) {
          console.error("Error al leer perfil de usuario:", e);
          const targetEmail = firebaseUser.email?.trim().toLowerCase() || '';
          let role: 'admin' | 'engineer' = 'engineer';
          let engineerId: string | undefined;
          if (targetEmail === 'alexis.guerra@orimec.com.ec') role = 'admin';
          else {
            const matchedEng = masterEngineers.find(eng => eng.email.trim().toLowerCase() === targetEmail);
            if (matchedEng) {
              role = 'engineer';
              engineerId = matchedEng.id;
            }
          }
          setCurrentUser({
            uid: firebaseUser.uid,
            email: targetEmail,
            role,
            engineerId
          });
          if (role === 'engineer') setActiveTab('engineer');
          else setActiveTab('admin');
        }
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubAuth();
  }, [isDemoMode]);

  // Sincronizar Firestore en tiempo real directamente
  useEffect(() => {
    setDbLoading(true);
    setDbError(null);

    // 1. Suscribirse a la Colección de Ingenieros
    const unsubEngineers = onSnapshot(collection(db, 'engineers'), (snapshot) => {
      const list: Engineer[] = [];
      snapshot.forEach(docSnap => {
        if (docSnap.id !== 'fsm_placeholder') {
          list.push(docSnap.data() as Engineer);
        }
      });
      
      // Auto-seed if database has no engineers registered
      if (list.length === 0) {
        import('firebase/firestore').then(({ setDoc, doc }) => {
          masterEngineers.forEach(async (eng) => {
            try {
              await setDoc(doc(db, 'engineers', eng.id), eng);
            } catch (e) {
              console.warn("Failed to seed master engineer:", eng.name, e);
            }
          });
        });
      }
      
      setEngineers(list);
    }, (error) => {
      console.warn("Error leyendo ingenieros de Firestore:", error);
      setDbError("Missing or insufficient permissions en la colección 'engineers'");
      setDbLoading(false);
    });

    // 2. Suscribirse a la Colección de Clientes
    const unsubClients = onSnapshot(collection(db, 'clients'), (snapshot) => {
      const list: Client[] = [];
      snapshot.forEach(docSnap => {
        if (docSnap.id !== 'fsm_placeholder') {
          list.push(docSnap.data() as Client);
        }
      });
      setClients(list);
    }, (error) => {
      console.warn("Error leyendo clientes de Firestore:", error);
      setDbError("Missing or insufficient permissions en la colección 'clients'");
      setDbLoading(false);
    });

    // 3. Suscribirse a la Colección de Órdenes de Trabajo (Work Orders)
    const unsubOrders = onSnapshot(collection(db, 'workOrders'), (snapshot) => {
      const list: WorkOrder[] = [];
      snapshot.forEach(docSnap => {
        if (docSnap.id !== 'fsm_placeholder') {
          list.push(docSnap.data() as WorkOrder);
        }
      });
      const sorted = list.sort((a, b) => b.id.localeCompare(a.id));
      setWorkOrders(sorted);
    }, (error) => {
      console.warn("Error leyendo órdenes de trabajo de Firestore:", error);
      setDbError("Missing or insufficient permissions en la colección 'workOrders'");
      setDbLoading(false);
    });

    // 4. Suscribirse a la Colección de Reportes Técnicos
    const unsubReports = onSnapshot(collection(db, 'reports'), (snapshot) => {
      const list: TechnicalReport[] = [];
      snapshot.forEach(docSnap => {
        if (docSnap.id !== 'fsm_placeholder') {
          list.push(docSnap.data() as TechnicalReport);
        }
      });
      setReports(list);
      setDbLoading(false);
    }, (error) => {
      console.warn("Error leyendo reportes de Firestore:", error);
      setDbError("Missing or insufficient permissions en la colección 'reports'");
      setDbLoading(false);
    });

    // 5. Suscribirse a la Colección de Equipos
    const unsubEquipments = onSnapshot(collection(db, 'equipments'), (snapshot) => {
      const list: Equipment[] = [];
      snapshot.forEach(docSnap => {
        if (docSnap.id !== 'fsm_placeholder') {
          list.push(docSnap.data() as Equipment);
        }
      });
      setEquipments(list);
    }, (error) => {
      console.warn("Error leyendo equipos de Firestore:", error);
    });

    // 6. Suscribirse a la Colección de Contratos
    const unsubContracts = onSnapshot(collection(db, 'contracts'), (snapshot) => {
      const list: Contract[] = [];
      snapshot.forEach(docSnap => {
        if (docSnap.id !== 'fsm_placeholder') {
          list.push(docSnap.data() as Contract);
        }
      });
      setContracts(list);
    }, (error) => {
      console.warn("Error leyendo contratos de Firestore:", error);
    });

    // 7. Suscribirse a la Colección de Vacaciones
    const unsubVacations = onSnapshot(collection(db, 'vacations'), (snapshot) => {
      const list: Vacation[] = [];
      snapshot.forEach(docSnap => {
        if (docSnap.id !== 'fsm_placeholder') {
          list.push(docSnap.data() as Vacation);
        }
      });
      setVacations(list);
    }, (error) => {
      console.warn("Error leyendo vacaciones de Firestore:", error);
    });

    // 8. Suscribirse a la Colección de Permisos
    const unsubPermissions = onSnapshot(collection(db, 'permissions'), (snapshot) => {
      const list: EngineerPermission[] = [];
      snapshot.forEach(docSnap => {
        if (docSnap.id !== 'fsm_placeholder') {
          list.push(docSnap.data() as EngineerPermission);
        }
      });
      setPermissions(list);
    }, (error) => {
      console.warn("Error leyendo permisos de Firestore:", error);
    });

    // 9. Suscribirse a la Colección de Registros de Mantenimiento
    const unsubRegistries = onSnapshot(collection(db, 'maintenanceRegistries'), (snapshot) => {
      const list: MaintenanceRegistry[] = [];
      snapshot.forEach(docSnap => {
        if (docSnap.id !== 'fsm_placeholder') {
          list.push(docSnap.data() as MaintenanceRegistry);
        }
      });
      setMaintenanceRegistries(list);
    }, (error) => {
      console.warn("Error leyendo registros de mantenimiento de Firestore:", error);
    });

    return () => {
      unsubEngineers();
      unsubClients();
      unsubOrders();
      unsubReports();
      unsubEquipments();
      unsubContracts();
      unsubVacations();
      unsubPermissions();
      unsubRegistries();
    };
  }, []);

  const handleClearAllData = async () => {
    if (window.confirm("¿Está seguro de que desea borrar toda la información (órdenes, reportes, clientes y técnicos) de Firestore para empezar desde cero?")) {
      try {
        showNotification("Borrando datos en Firestore...", "info");
        const { deleteDoc, doc } = await import('firebase/firestore');
        const deleteErrors: string[] = [];

        // Hacemos copias de los arreglos actuales antes de borrarlos
        const engsToDelete = [...engineers];
        const clisToDelete = [...clients];
        const wosToDelete = [...workOrders];
        const repsToDelete = [...reports];

        // Borrar ingenieros
        for (const eng of engsToDelete) {
          try {
            await deleteDoc(doc(db, 'engineers', eng.id));
          } catch (e: any) {
            deleteErrors.push(`Técnico ${eng.name}: ${e.message || e}`);
          }
        }
        // Borrar clientes
        for (const cli of clisToDelete) {
          try {
            await deleteDoc(doc(db, 'clients', cli.id));
          } catch (e: any) {
            deleteErrors.push(`Cliente ${cli.name}: ${e.message || e}`);
          }
        }
        // Borrar órdenes
        for (const wo of wosToDelete) {
          try {
            await deleteDoc(doc(db, 'workOrders', wo.id));
          } catch (e: any) {
            deleteErrors.push(`Orden ${wo.id}: ${e.message || e}`);
          }
        }
        // Borrar reportes
        for (const rep of repsToDelete) {
          try {
            await deleteDoc(doc(db, 'reports', rep.id));
          } catch (e: any) {
            deleteErrors.push(`Reporte ${rep.id}: ${e.message || e}`);
          }
        }

        if (deleteErrors.length > 0) {
          console.error("Errores al borrar documentos en Firestore:", deleteErrors);
          alert(
            "⚠️ RESTRICCIÓN DE ESCRITURA EN CLOUD:\nNo se pudo limpiar la base de datos en la nube de Firestore (permisos insuficientes).\n\n" +
            "Por favor, verifique las Reglas de Seguridad en su Consola de Firebase."
          );
        } else {
          // Re-seed master engineers immediately
          const { setDoc } = await import('firebase/firestore');
          for (const eng of masterEngineers) {
            await setDoc(doc(db, 'engineers', eng.id), eng);
          }
          setEngineers(masterEngineers);
          setClients([]);
          setWorkOrders([]);
          setReports([]);
          showNotification("¡Todos los datos en Firestore se borraron con éxito y se reestablecieron los 11 técnicos maestros!", "success");
        }
      } catch (error: any) {
        console.error("Error general limpiando Firestore:", error);
        showNotification("Error al limpiar Firestore: " + (error.message || error), "warning");
      }
    }
  };

  const showNotification = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 6000);
  };

  const handleAddClient = async (newClient: Client) => {
    try {
      await setDoc(doc(db, 'clients', newClient.id), cleanUndefined(newClient));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `clients/${newClient.id}`);
    }
  };

  const handleAddWorkOrder = async (newWO: WorkOrder) => {

    try {
      await setDoc(doc(db, 'workOrders', newWO.id), cleanUndefined(newWO));
      showNotification(`Orden de trabajo ${newWO.id} asignada y guardada con éxito en Firestore.`, 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `workOrders/${newWO.id}`);
    }
  };

  const handleImportData = async (
    newWOs: WorkOrder[],
    newReps: TechnicalReport[],
    newClients: Client[] = [],
    newEngineers: Engineer[] = []
  ) => {
    try {
      showNotification(`Guardando datos importados en Firestore...`, 'info');
      
      // Save new clients
      for (const cli of newClients) {
        await setDoc(doc(db, 'clients', cli.id), cleanUndefined(cli));
      }

      // Save new engineers
      for (const eng of newEngineers) {
        await setDoc(doc(db, 'engineers', eng.id), cleanUndefined(eng));
      }

      for (const wo of newWOs) {
        await setDoc(doc(db, 'workOrders', wo.id), cleanUndefined(wo));
      }
      for (const rep of newReps) {
        await setDoc(doc(db, 'reports', rep.id), cleanUndefined(rep));
      }
      showNotification(`¡Sincronización de CSV completa! Se guardaron ${newWOs.length} órdenes, ${newReps.length} informes, ${newClients.length} clientes y ${newEngineers.length} técnicos en Firestore.`, 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'bulk-import');
    }
  };

  const handleAddEquipment = async (newEquip: Equipment) => {
    try {
      await setDoc(doc(db, 'equipments', newEquip.id), cleanUndefined(newEquip));
      showNotification(`Equipo ${newEquip.name} registrado con éxito.`, 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `equipments/${newEquip.id}`);
    }
  };

  const handleUpdateEquipment = async (updatedEquip: Equipment) => {
    try {
      await setDoc(doc(db, 'equipments', updatedEquip.id), cleanUndefined(updatedEquip));
      showNotification(`Equipo ${updatedEquip.name} actualizado.`, 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `equipments/${updatedEquip.id}`);
    }
  };

  const handleAddContract = async (newContract: Contract) => {
    try {
      await setDoc(doc(db, 'contracts', newContract.id), cleanUndefined(newContract));
      showNotification(`Contrato ${newContract.id} registrado con éxito.`, 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `contracts/${newContract.id}`);
    }
  };

  const handleUpdateContract = async (updatedContract: Contract) => {
    try {
      await setDoc(doc(db, 'contracts', updatedContract.id), cleanUndefined(updatedContract));
      showNotification(`Contrato ${updatedContract.id} actualizado.`, 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `contracts/${updatedContract.id}`);
    }
  };

  const handleBulkUploadClients = async (newClients: Client[]) => {
    try {
      showNotification(`Cargando ${newClients.length} clientes en Firestore...`, 'info');
      for (const cli of newClients) {
        await setDoc(doc(db, 'clients', cli.id), cleanUndefined(cli));
      }
      showNotification(`¡Carga masiva exitosa! Se importaron ${newClients.length} clientes.`, 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'bulk-clients');
    }
  };

  const handleBulkUploadEquipments = async (newEquips: Equipment[]) => {
    try {
      showNotification(`Cargando ${newEquips.length} equipos en Firestore...`, 'info');
      for (const eq of newEquips) {
        await setDoc(doc(db, 'equipments', eq.id), cleanUndefined(eq));
      }
      showNotification(`¡Carga masiva exitosa! Se importaron ${newEquips.length} equipos.`, 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'bulk-equipments');
    }
  };

  const handleBulkUploadMaintenanceRegistries = async (registries: MaintenanceRegistry[]) => {
    try {
      const BATCH_SIZE = 400;
      const totalBatches = Math.ceil(registries.length / BATCH_SIZE);
      showNotification(`Cargando ${registries.length} registros en ${totalBatches} lote(s)...`, 'info');

      for (let b = 0; b < totalBatches; b++) {
        const slice = registries.slice(b * BATCH_SIZE, (b + 1) * BATCH_SIZE);
        const batch = writeBatch(db);
        slice.forEach(reg => {
          batch.set(doc(db, 'maintenanceRegistries', reg.id), cleanUndefined(reg));
        });
        await batch.commit();
        if (totalBatches > 1) {
          showNotification(`Lote ${b + 1}/${totalBatches} guardado...`, 'info');
        }
      }

      // ── Actualizar el estado local INMEDIATAMENTE (no esperar al onSnapshot) ──
      setMaintenanceRegistries(prev => {
        // Merge: keep existing records that don't clash, then add all new ones
        const newIds = new Set(registries.map(r => r.id));
        const kept = prev.filter(r => !newIds.has(r.id));
        return [...kept, ...registries];
      });

      showNotification(`¡Carga masiva exitosa! Se importaron ${registries.length} registros.`, 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'bulk-maintenance-registries');
    }
  };

  const handleClearMaintenanceRegistries = async () => {
    try {
      showNotification("Eliminando registros de la base de datos...", 'info');
      const qSnap = await getDocs(collection(db, 'maintenanceRegistries'));
      const BATCH_SIZE = 400;
      const docs = qSnap.docs;
      for (let b = 0; b < Math.ceil(docs.length / BATCH_SIZE); b++) {
        const slice = docs.slice(b * BATCH_SIZE, (b + 1) * BATCH_SIZE);
        const batch = writeBatch(db);
        slice.forEach(d => batch.delete(doc(db, 'maintenanceRegistries', d.id)));
        await batch.commit();
      }
      showNotification("Se eliminaron todos los registros correctamente.", 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'clear-maintenance-registries');
    }
  };

  const handleAddMaintenanceRegistry = async (reg: MaintenanceRegistry) => {
    try {
      await setDoc(doc(db, 'maintenanceRegistries', reg.id), cleanUndefined(reg));
      showNotification(`Registro de ${reg.institutionName} guardado con éxito.`, 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `maintenanceRegistries/${reg.id}`);
    }
  };

  const handleClearEquipments = async () => {
    try {
      showNotification("Eliminando equipos de la base de datos...", 'info');
      const qSnap = await getDocs(collection(db, 'equipments'));
      for (const docSnap of qSnap.docs) {
        await deleteDoc(doc(db, 'equipments', docSnap.id));
      }
      showNotification("Se eliminaron todos los equipos correctamente.", 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'clear-equipments');
    }
  };

  const handleBulkUploadContracts = async (newContracts: Contract[]) => {
    try {
      showNotification(`Cargando ${newContracts.length} contratos en Firestore...`, 'info');
      for (const con of newContracts) {
        await setDoc(doc(db, 'contracts', con.id), cleanUndefined(con));
      }
      showNotification(`¡Carga masiva exitosa! Se importaron ${newContracts.length} contratos.`, 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'bulk-contracts');
    }
  };

  const handleAddVacation = async (vac: Vacation) => {
    try {
      await setDoc(doc(db, 'vacations', vac.id), cleanUndefined(vac));
      showNotification(`Vacaciones registradas correctamente.`, 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `vacations/${vac.id}`);
    }
  };

  const handleUpdateVacation = async (vac: Vacation) => {
    try {
      await setDoc(doc(db, 'vacations', vac.id), cleanUndefined(vac));
      showNotification(`Estado de vacaciones actualizado.`, 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `vacations/${vac.id}`);
    }
  };

  const handleDeleteVacation = async (vacId: string) => {
    try {
      await deleteDoc(doc(db, 'vacations', vacId));
      showNotification(`Vacaciones eliminadas correctamente.`, 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `vacations/${vacId}`);
    }
  };

  const handleAddPermission = async (perm: EngineerPermission) => {
    try {
      await setDoc(doc(db, 'permissions', perm.id), cleanUndefined(perm));
      showNotification(`Registro de ${perm.type === 'Permiso' ? 'permiso' : 'compensación'} guardado correctamente.`, 'success');
    } catch (error: any) {
      console.error("Error al guardar permiso:", error);
      alert(`⚠️ ERROR EN FIREBASE:\nNo se pudo guardar el registro en la colección 'permissions'.\n\nDetalle: ${error.message || String(error)}\n\nPor favor verifique que las Reglas de Seguridad de Firestore estén actualizadas.`);
      handleFirestoreError(error, OperationType.WRITE, `permissions/${perm.id}`);
    }
  };

  const handleDeletePermission = async (permId: string) => {
    try {
      await deleteDoc(doc(db, 'permissions', permId));
      showNotification(`Registro eliminado correctamente.`, 'success');
    } catch (error: any) {
      console.error("Error al eliminar permiso:", error);
      alert(`⚠️ ERROR EN FIREBASE:\nNo se pudo eliminar el registro en la colección 'permissions'.\n\nDetalle: ${error.message || String(error)}`);
      handleFirestoreError(error, OperationType.DELETE, `permissions/${permId}`);
    }
  };

  const handleUpdateWorkOrderStatus = async (woId: string, status: WorkOrderStatus) => {
    try {
      await setDoc(doc(db, 'workOrders', woId), { status }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `workOrders/${woId}`);
    }
  };

  const handleUpdateWorkOrder = async (updatedWO: WorkOrder) => {
    try {
      await setDoc(doc(db, 'workOrders', updatedWO.id), cleanUndefined(updatedWO));
      showNotification(`¡Orden de servicio ${updatedWO.id} actualizada con éxito!`, 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `workOrders/${updatedWO.id}`);
    }
  };

  const handleUpdateEngineer = async (updatedEng: Engineer) => {
    try {
      await setDoc(doc(db, 'engineers', updatedEng.id), cleanUndefined(updatedEng));
      showNotification(`¡Técnico ${updatedEng.name} guardado con éxito!`, 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `engineers/${updatedEng.id}`);
    }
  };

  const handleDeleteEngineer = async (engId: string) => {
    try {
      await deleteDoc(doc(db, 'engineers', engId));
      showNotification(`¡Técnico eliminado con éxito de Firestore!`, 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `engineers/${engId}`);
    }
  };

  const handleDeleteWorkOrders = async (woIds: string[]) => {
    try {
      for (const id of woIds) {
        await deleteDoc(doc(db, 'workOrders', id));
      }
      showNotification(`¡Agendas del mes eliminadas con éxito (${woIds.length} órdenes)!`, 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `workOrders`);
    }
  };

  const handleMergeEngineers = async (sourceId: string, targetId: string) => {
    try {
      // 1. Find all work orders where sourceId is engineerId or supportEngineerId
      const sourceWOs = workOrders.filter(wo => wo.engineerId === sourceId || wo.supportEngineerId === sourceId);
      
      // 2. Update each work order in Firestore
      for (const wo of sourceWOs) {
        const updates: Partial<WorkOrder> = {};
        if (wo.engineerId === sourceId) {
          updates.engineerId = targetId;
        }
        if (wo.supportEngineerId === sourceId) {
          updates.supportEngineerId = targetId;
        }
        await setDoc(doc(db, 'workOrders', wo.id), updates, { merge: true });
      }
      
      // 3. Delete the source engineer document from Firestore
      await deleteDoc(doc(db, 'engineers', sourceId));
      
      showNotification(`¡Técnicos fusionados con éxito! Se reasignaron ${sourceWOs.length} órdenes de trabajo.`, 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `engineers/merge`);
    }
  };

  const handleBatchReportWorkOrders = async (
    newReports: TechnicalReport[],
    woUpdates: { id: string; status: WorkOrderStatus }[]
  ) => {
    try {
      showNotification(`Reportando y guardando reportes de todo el mes...`, 'info');
      const batch = writeBatch(db);

      for (const update of woUpdates) {
        const woRef = doc(db, 'workOrders', update.id);
        batch.set(woRef, { status: update.status }, { merge: true });
      }

      for (const rep of newReports) {
        const repRef = doc(db, 'reports', rep.id);
        batch.set(repRef, cleanUndefined(rep));
      }

      await batch.commit();
      showNotification(`¡Reportes del mes generados con éxito (${newReports.length} órdenes)!`, 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'batch-report');
    }
  };

  const handleSubmitTechnicalReport = async (newReport: TechnicalReport) => {
    try {
      await setDoc(doc(db, 'reports', newReport.id), cleanUndefined(newReport));
      showNotification(`¡Reporte técnico ${newReport.id} guardado con éxito en Firestore!`, 'info');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `reports/${newReport.id}`);
    }
  };

  const handleValidateReport = async (woId: string, state: 'aprobado' | 'rechazado', notes: string) => {
    try {
      const matchedRep = reports.find(r => r.workOrderId === woId);
      if (matchedRep) {
        const updatedRep: Partial<TechnicalReport> = {
          validationState: state,
          validationNotes: notes,
          validatedAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'reports', matchedRep.id), updatedRep, { merge: true });
      }

      const targetStatus = state === 'aprobado' ? 'Conciliado' : 'En Proceso';
      await setDoc(doc(db, 'workOrders', woId), { status: targetStatus }, { merge: true });

      if (state === 'aprobado') {
        showNotification(`Orden ${woId} conciliada y saldada con éxito en Firestore.`, 'success');
      } else {
        showNotification(`Reporte de la orden ${woId} rechazado con observaciones en Firestore.`, 'warning');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `validate-report/${woId}`);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Guard: mostrando spinner de autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-500">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Guard: usuario no autenticado → mostrar Login
  if (!currentUser) {
    return (
      <Login
        engineers={engineers}
        onLoginSuccess={(user, isDemo) => {
          setCurrentUser(user);
          setIsDemoMode(isDemo);
          setActiveTab(user.role === 'admin' ? 'admin' : 'engineer');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between" id="app-root">
      {/* Top Banner Branding */}
      <header className="sticky top-0 bg-white border-b border-slate-200 z-50 px-4 md:px-6 py-2 flex items-center justify-between shadow-2xs no-print">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-650 text-white p-1.5 rounded-lg shadow-sm">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="font-extrabold text-xs text-slate-900 tracking-tight">Gestión Técnica</h1>
              <span className="bg-indigo-50 text-indigo-700 text-[8px] font-bold px-1.5 py-0.2 rounded border border-indigo-100 uppercase tracking-wider">
                PRO
              </span>
              {dbError ? (
                <span className="bg-rose-50 text-rose-800 text-[8px] font-bold px-1.5 py-0.2 rounded border border-rose-100 uppercase tracking-wide flex items-center gap-1">
                  <Database className="w-2 h-2 text-rose-500" />
                  <span>Error</span>
                </span>
              ) : (
                <span className="bg-emerald-50 text-emerald-800 text-[8px] font-bold px-1.5 py-0.2 rounded border border-emerald-100 uppercase tracking-wide flex items-center gap-1">
                  <Database className="w-2 h-2 text-emerald-500" />
                  <span>Sincronizando Cloud</span>
                </span>
              )}
            </div>
            <p className="text-[9px] text-slate-400 font-semibold leading-none mt-0.5">Plataforma de Gestión Técnica</p>
          </div>
        </div>

        {/* Action Controls & Navigation Switcher */}
        <div className="flex items-center gap-3">
          {/* User Status and Logout Button */}
          <div className="flex items-center gap-2 border-r border-slate-200 pr-3 mr-1">
            <div className="text-right">
              <p className="text-[9px] font-extrabold text-slate-900 leading-none">{currentUser.email}</p>
              <p className="text-[8px] font-bold text-indigo-650 mt-1 leading-none uppercase tracking-wide">
                {currentUser.role === 'admin' ? 'Administrador' : 'Ingeniero'} {isDemoMode && '(Demo)'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-500 hover:text-rose-600 text-[9px] font-bold px-2 py-1 rounded-md hover:bg-slate-50 border border-slate-200 transition-all cursor-pointer"
            >
              Salir
            </button>
          </div>

          {currentUser.role === 'admin' && (
            <>
              {/* Discrete clear DB button */}
              <button
                onClick={handleClearAllData}
                className="text-slate-400 hover:text-rose-600 text-[9px] font-bold px-2 py-1 rounded-md hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer flex items-center gap-1"
                title="Restablecer base de datos maestra"
              >
                <Trash2 className="w-3 h-3 text-rose-500" />
                <span className="hidden sm:inline">Restablecer BD</span>
              </button>

              {/* Navigation Switcher Capsule */}
              <nav className="flex bg-slate-100/80 p-0.5 rounded-lg border border-slate-200/60" id="nav-container-tabs">
                {[
                  { id: 'admin', label: 'Administrador', icon: CalendarDays },
                  { id: 'engineer', label: 'Ingeniero Portal', icon: Smartphone },
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      id={`btn-global-tab-${tab.id}`}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                        isActive
                          ? 'bg-white text-indigo-950 shadow-2xs font-extrabold border border-slate-200/30'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-white/20'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </>
          )}
        </div>
      </header>

      {/* Floating System Messages */}
      {notification && (
        <div className="fixed top-20 right-4 md:right-8 z-50 max-w-sm" id="global-alert-toast">
          <div className={`p-4 rounded-xl border flex gap-3 shadow-xl ${
            notification.type === 'success' 
              ? 'bg-emerald-50 border-emerald-150 text-emerald-800' 
              : notification.type === 'warning'
              ? 'bg-red-50 border-red-150 text-red-800'
              : 'bg-indigo-50 border-indigo-150 text-indigo-800'
          }`}>
            <Sparkles className="w-5 h-5 shrink-0" />
            <div className="text-2xs">
              <p className="font-bold">Notificación de Simulación</p>
              <p className="mt-0.5 leading-relaxed font-semibold">{notification.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Primary interactive layout body */}
      <main className={`flex-1 w-full mx-auto ${activeTab === 'engineer' ? 'max-w-full p-0 sm:max-w-7xl sm:p-4 md:p-8' : 'max-w-7xl p-4 md:p-8'}`}>
        {dbLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4" id="db-loading-spinner">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <div>
              <p className="font-extrabold text-xs text-slate-800 tracking-tight">Estableciendo sincronización en tiempo real...</p>
              <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">Conectando de forma segura a Firebase Firestore (mtorimec)</p>
            </div>
          </div>
        ) : (
          <>
            {dbError && (
              <div className="max-w-7xl mx-auto mb-6 bg-rose-50 border border-rose-150 p-4 rounded-xl flex gap-3 text-rose-800">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <div className="text-2xs">
                  <p className="font-bold">⚠️ Error de Sincronización en la Base de Datos</p>
                  <p className="mt-0.5 font-semibold leading-normal">
                    La aplicación no puede escribir o sincronizar datos con Firestore. Por favor, verifique y publique las Reglas de Seguridad en su consola de Firebase ({dbError}).
                  </p>
                </div>
              </div>
            )}
            {activeTab === 'admin' && (
              <AdminPortal
                engineers={engineers}
                clients={clients}
                workOrders={workOrders}
                reports={reports}
                equipments={equipments}
                contracts={contracts}
                vacations={vacations}
                onAddWorkOrder={handleAddWorkOrder}
                onUpdateWorkOrderStatus={handleUpdateWorkOrderStatus}
                onUpdateWorkOrder={handleUpdateWorkOrder}
                onSubmitTechnicalReport={handleSubmitTechnicalReport}
                onValidateReport={handleValidateReport}
                onImportData={handleImportData}
                onUpdateEngineer={handleUpdateEngineer}
                onDeleteEngineer={handleDeleteEngineer}
                onDeleteWorkOrders={handleDeleteWorkOrders}
                onMergeEngineers={handleMergeEngineers}
                onBatchReportWorkOrders={handleBatchReportWorkOrders}
                onAddClient={handleAddClient}
                onAddEquipment={handleAddEquipment}
                onUpdateEquipment={handleUpdateEquipment}
                onAddContract={handleAddContract}
                onUpdateContract={handleUpdateContract}
                onBulkUploadClients={handleBulkUploadClients}
                onBulkUploadEquipments={handleBulkUploadEquipments}
                onBulkUploadContracts={handleBulkUploadContracts}
                onClearEquipments={handleClearEquipments}
                onAddVacation={handleAddVacation}
                onUpdateVacation={handleUpdateVacation}
                onDeleteVacation={handleDeleteVacation}
                permissions={permissions}
                onAddPermission={handleAddPermission}
                onDeletePermission={handleDeletePermission}
                maintenanceRegistries={maintenanceRegistries}
                onAddMaintenanceRegistry={handleAddMaintenanceRegistry}
                onBulkUploadMaintenanceRegistries={handleBulkUploadMaintenanceRegistries}
                onClearMaintenanceRegistries={handleClearMaintenanceRegistries}
              />
            )}
            {activeTab === 'engineer' && (
              <EngineerPortal
                engineers={engineers}
                clients={clients}
                workOrders={workOrders}
                reports={reports}
                vacations={vacations}
                onUpdateWorkOrderStatus={handleUpdateWorkOrderStatus}
                onSubmitTechnicalReport={handleSubmitTechnicalReport}
                onImportData={handleImportData}
                onUpdateEngineer={handleUpdateEngineer}
                onAddVacation={handleAddVacation}
                permissions={permissions}
                onAddPermission={handleAddPermission}
                lockedEngineerId={currentUser.role === 'engineer' ? currentUser.engineerId : undefined}
              />
            )}
          </>
        )}
      </main>

      {/* Slate Styled Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 md:px-8">
        <div className="max-w-7xl w-full mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">v1.2.0-PROTOTYPE</span>
            <span>Ref: 2626 XLSM Migration Consultant</span>
          </div>
          <p>© 2026 Gestión Técnica. Propuesta de Arquitectura y Diseño UX/UI para Conciliaciones de Soporte.</p>
        </div>
      </footer>
    </div>
  );
}
