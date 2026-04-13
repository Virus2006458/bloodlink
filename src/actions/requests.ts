'use server'

import { createClient } from '@/lib/server-supabase'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createRequest(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('User not authenticated')

    const bloodGroup = formData.get('blood_group') as string
    const city = formData.get('city') as string
    const notes = formData.get('notes') as string || ''
    const prescriptionFile = formData.get('prescription') as File
    const patientPhotoFile = formData.get('patient_photo') as File
    
    // New fields
    const patientName = formData.get('patient_name') as string
    const patientAgeString = formData.get('patient_age') as string
    const patientAge = patientAgeString ? parseInt(patientAgeString) : null
    const patientGender = formData.get('patient_gender') as string

    if (!bloodGroup || !city) {
      throw new Error('Blood group and city are required.')
    }

    // 1. Upload Prescription if exists
    let prescription_url = null
    if (prescriptionFile && prescriptionFile.size > 0) {
      const fileName = `prescriptions/${user.id}-${Date.now()}`
      const { error: uploadError } = await supabase.storage
        .from('requests')
        .upload(fileName, prescriptionFile)
      
      if (uploadError) throw new Error(`Prescription upload failed: ${uploadError.message}`)
      
      const { data: { publicUrl } } = supabase.storage.from('requests').getPublicUrl(fileName)
      prescription_url = publicUrl
    }

    // 2. Upload Patient Photo if exists
    let patient_photo_url = null
    if (patientPhotoFile && patientPhotoFile.size > 0) {
      const fileName = `photos/${user.id}-${Date.now()}`
      const { error: uploadError } = await supabase.storage
        .from('requests')
        .upload(fileName, patientPhotoFile)
      
      if (uploadError) throw new Error(`Patient photo upload failed: ${uploadError.message}`)
      
      const { data: { publicUrl } } = supabase.storage.from('requests').getPublicUrl(fileName)
      patient_photo_url = publicUrl
    }

    // 3. Create database record
    const { error: dbError } = await supabase
      .from('requests')
      .insert({
        receiver_id: user.id,
        blood_group: bloodGroup,
        city: city,
        notes: notes,
        prescription_url,
        patient_photo_url,
        patient_name: patientName,
        patient_age: patientAge,
        patient_gender: patientGender,
        status: 'pending'
      })

    if (dbError) {
      console.error('Database Insertion Error:', dbError)
      throw new Error(`Database error: ${dbError.message}`)
    }

    revalidatePath('/dashboard')
    // Standard Next.js way to navigate from a Server Action
    redirect('/dashboard')
  } catch (error: any) {
    // If it's a redirect error, we should let it propagate
    if (error.digest?.startsWith('NEXT_REDIRECT')) {
      throw error
    }
    console.error('Detailed Create Request Error:', error)
    return { success: false, error: error.message || 'An unexpected server error occurred. Please check your Supabase logs.' }
  }
}

export async function acceptRequest(requestId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
      .from('requests')
      .update({ 
        status: 'accepted',
        donor_id: user.id 
      })
      .eq('id', requestId)

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    console.error('Accept Request Error:', error.message)
    return { success: false, error: error.message || 'Failed to accept request' }
  }
}

export async function rejectRequest(requestId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('requests')
    .update({ status: 'rejected' })
    .eq('id', requestId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateAvailability(available: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('users')
    .update({ availability_status: available })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function fulfillRequest(requestId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
      .from('requests')
      .update({ status: 'fulfilled' })
      .eq('id', requestId)
      .eq('donor_id', user.id)

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    console.error('Fulfill Request Error:', error.message)
    return { success: false, error: error.message || 'Failed to complete mission' }
  }
}

export async function getActiveRequests(city?: string, bloodGroup?: string) {
  const supabase = await createClient()
  let query = supabase
    .from('requests')
    .select('*, receiver:users(name)')
    .eq('status', 'pending')

  if (city) query = query.eq('city', city)
  if (bloodGroup) query = query.eq('blood_group', bloodGroup)

  const { data, error } = await query.order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}
