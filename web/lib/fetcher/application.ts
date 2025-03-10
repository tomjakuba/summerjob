/* eslint-disable @typescript-eslint/no-explicit-any */

import type { ApplicationsAPIGetResponse } from 'pages/api/applications'
import type { ApplicationAPIGetResponse } from 'pages/api/applications/[id]'
import type {
  ApplicationCreateDataInput,
  ApplicationUpdateDataInput,
} from 'lib/types/application'
import {
  useData,
  useDataCreate,
  useDataDelete,
  useDataPartialUpdate,
} from './fetcher'

export function useAPIApplicationUpdate(applicationId: string, options?: any) {
  return useDataPartialUpdate<ApplicationUpdateDataInput>(
    `/api/applications/${applicationId}`,
    options
  )
}

export function useAPIApplications(options?: any) {
  return useData<ApplicationsAPIGetResponse>('/api/applications', options)
}

export function useAPIApplication(id: string) {
  return useData<ApplicationAPIGetResponse>(`/api/applications/${id}`)
}

export function useAPIApplicationDelete(id: string, options?: any) {
  return useDataDelete(`/api/applications/${id}`, options)
}

export function useAPIApplicationCreate(options?: any) {
  return useDataCreate<ApplicationCreateDataInput>(
    '/api/applications/new',
    options
  )
}
