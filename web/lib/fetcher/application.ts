/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */

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

function convertToFormData(
  data: ApplicationCreateDataInput | ApplicationUpdateDataInput
) {
  const formData = new FormData()

  Object.keys(data).forEach(key => {
    const value = (data as any)[key]
    if (value !== undefined && key !== 'photoFile') {
      formData.append(key, value)
    }
  })

  if (data.photoFile instanceof File) {
    formData.append('photoFile', data.photoFile)
  }

  return formData
}

export function useAPIApplicationUpdate(applicationId: string, options?: any) {
  return async (data: ApplicationUpdateDataInput) => {
    const formData = convertToFormData(data)

    return useDataPartialUpdate<FormData>(
      `/api/applications/${applicationId}`,
      {
        ...options,
        method: 'PATCH',
        body: formData,
      }
    )
  }
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
