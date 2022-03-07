import LightningDatatable from 'lightning/datatable';
import folder from './folder.html';
import preview from './preview.html';
import note from './note.html';
import gdrive from './gdrive.html';

export default class MortgagesDocumentsDataTable extends LightningDatatable {
  static customTypes = {
    folder: {
      template: folder,
      standardCellLayout: true,
      typeAttributes: ['onclick', 'label']
    },
    preview: {
      template: preview,
      standardCellLayout: true,
      typeAttributes: ['fileId', 'review']
    },
    note: {
      template: note,
      standardCellLayout: true,
      typeAttributes: ['documentId']
    },
    gdrive: {
      template: gdrive,
      standardCellLayout: true,
      typeAttributes: ['onclick', 'label', 'folder']
    }
  }
}