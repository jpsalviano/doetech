import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EnvironmentService {
  private readonly apiConfig = {
    baseUrlRestV1: 'http://localhost:8080/api/v1/doetech',
    baseUrlFiles: 'http://localhost:8080/api/v1/doetech/file',
    endpoints: {
      user: {
        base: '/user',
        login: '/user/login',
        recover: '/user/recover',
        getById: (userId: string) => `/user/${userId}`,
        delete: (userId: string) => `/user/${userId}`,
        query: '/user/query',
      },
      account: {
        base: '/account',
        getById: (accountId: string) => `/account/${accountId}`,
        getByUserId: (userId: string) => `/account/user/${userId}`,
        delete: (accountId: string) => `/account/${accountId}`,
        query: '/account/query',
      },
      equipment: {
        base: '/equipment',
        getById: (equipmentId: string) => `/equipment/${equipmentId}`,
        updateStatus: (equipmentId: string) =>
          `/equipment/${equipmentId}/status`,
        query: '/equipment/query',
      },
      donation: {
        base: '/donation',
        getById: (donationId: string) => `/donation/${donationId}`,
        update: (donationId: string) => `/donation/${donationId}`,
        updateStatus: (donationId: string) => `/donation/${donationId}/status`,
        query: '/donation/query',
      },
      notification: {
        base: '/notification',
        getById: (notificationId: string) => `/notification/${notificationId}`,
        update: (notificationId: string) => `/notification/${notificationId}`,
        markAsRead: (notificationId: string) =>
          `/notification/${notificationId}`,
        getAllByAccount: (accountId: string) =>
          `/notification/${accountId}/all`,
        query: '/notification/query',
        delete: (notificationId: string) => `/notification/${notificationId}`,
      },
      files: {
        base: '/file',
        upload: (type: string, id: string) => `/file/${type}/${id}`,
        getPresignedUrl: (type: string, id: string) =>
          `/file/${type}/${id}`,
      },
    },
  };

  constructor() {}

  get fileEndpoints() {
    return {
      base: this.apiConfig.baseUrlFiles,
      upload: (type: string, id: string) =>
        `${this.apiConfig.baseUrlFiles}/${type}/${id}`,
      getPresignedUrl: (type: string, id: string) =>
        `${this.apiConfig.baseUrlFiles}/${type}/${id}`,
    };
  };

  get userEndpoints() {
    return {
      base: this.apiConfig.baseUrlRestV1 + this.apiConfig.endpoints.user.base,
      login: this.apiConfig.baseUrlRestV1 + this.apiConfig.endpoints.user.login,
      recover: this.apiConfig.baseUrlRestV1 + this.apiConfig.endpoints.user.recover,
      getById: (userId: string) =>
        this.apiConfig.baseUrlRestV1 + this.apiConfig.endpoints.user.getById(userId),
      delete: (userId: string) =>
        this.apiConfig.baseUrlRestV1 + this.apiConfig.endpoints.user.delete(userId),
      query: this.apiConfig.baseUrlRestV1 + this.apiConfig.endpoints.user.query,
    };
  }

  get accountEndpoints() {
    return {
      base: this.apiConfig.baseUrlRestV1 + this.apiConfig.endpoints.account.base,
      getById: (accountId: string) =>
        this.apiConfig.baseUrlRestV1 +
        this.apiConfig.endpoints.account.getById(accountId),
      getByUserId: (userId: string) =>
        this.apiConfig.baseUrlRestV1 +
        this.apiConfig.endpoints.account.getByUserId(userId),
      delete: (accountId: string) =>
        this.apiConfig.baseUrlRestV1 +
        this.apiConfig.endpoints.account.delete(accountId),
      query: this.apiConfig.baseUrlRestV1 + this.apiConfig.endpoints.account.query,
    };
  }

  get equipmentEndpoints() {
    return {
      base: this.apiConfig.baseUrlRestV1 + this.apiConfig.endpoints.equipment.base,
      getById: (equipmentId: string) =>
        this.apiConfig.baseUrlRestV1 +
        this.apiConfig.endpoints.equipment.getById(equipmentId),
      updateStatus: (equipmentId: string) =>
        this.apiConfig.baseUrlRestV1 +
        this.apiConfig.endpoints.equipment.updateStatus(equipmentId),
      query: this.apiConfig.baseUrlRestV1 + this.apiConfig.endpoints.equipment.query,
    };
  }

  get donationEndpoints() {
    return {
      base: this.apiConfig.baseUrlRestV1 + this.apiConfig.endpoints.donation.base,
      getById: (donationId: string) =>
        this.apiConfig.baseUrlRestV1 +
        this.apiConfig.endpoints.donation.getById(donationId),
      update: (donationId: string) =>
        this.apiConfig.baseUrlRestV1 +
        this.apiConfig.endpoints.donation.update(donationId),
      updateStatus: (donationId: string) =>
        this.apiConfig.baseUrlRestV1 +
        this.apiConfig.endpoints.donation.updateStatus(donationId),
      query: this.apiConfig.baseUrlRestV1 + this.apiConfig.endpoints.donation.query,
    };
  }

  get notificationEndpoints() {
    return {
      base: this.apiConfig.baseUrlRestV1 + this.apiConfig.endpoints.notification.base,
      getById: (notificationId: string) =>
        this.apiConfig.baseUrlRestV1 +
        this.apiConfig.endpoints.notification.getById(notificationId),
      update: (notificationId: string) =>
        this.apiConfig.baseUrlRestV1 +
        this.apiConfig.endpoints.notification.update(notificationId),
      markAsRead: (notificationId: string) =>
        this.apiConfig.baseUrlRestV1 +
        this.apiConfig.endpoints.notification.markAsRead(notificationId),
      getAllByAccount: (accountId: string) =>
        this.apiConfig.baseUrlRestV1 +
        this.apiConfig.endpoints.notification.getAllByAccount(accountId),
      query:
        this.apiConfig.baseUrlRestV1 + this.apiConfig.endpoints.notification.query,
      delete: (notificationId: string) =>
        this.apiConfig.baseUrlRestV1 +
        this.apiConfig.endpoints.notification.delete(notificationId),
    };
  }

}
