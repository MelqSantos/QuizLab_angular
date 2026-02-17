import { Injectable } from '@angular/core';
import { ToastrService as NgxToastrService } from 'ngx-toastr';

export interface ToastConfig {
  timeOut?: number;
  progressBar?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ToasterService {
  constructor(private toastr: NgxToastrService) {}

  success(message: string, config?: ToastConfig) {
    this.toastr.success(message, 'Sucesso', {
      timeOut: config?.timeOut || 4000,
      progressBar: config?.progressBar !== false,
      closeButton: true
    });
  }

  error(message: string, config?: ToastConfig) {
    this.toastr.error(message, 'Erro', {
      timeOut: config?.timeOut || 4000,
      progressBar: config?.progressBar !== false,
      closeButton: true
    });
  }

  warning(message: string, config?: ToastConfig) {
    this.toastr.warning(message, 'Aviso', {
      timeOut: config?.timeOut || 4000,
      progressBar: config?.progressBar !== false,
      closeButton: true
    });
  }

  info(message: string, config?: ToastConfig) {
    this.toastr.info(message, 'Informação', {
      timeOut: config?.timeOut || 4000,
      progressBar: config?.progressBar !== false,
      closeButton: true
    });
  }
}
