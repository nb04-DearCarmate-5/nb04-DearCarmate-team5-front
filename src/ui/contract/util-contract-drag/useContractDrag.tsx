import { ContractStatus, ContractType } from '@shared/types'
import useEditContractStatus from '../data-access-contract-form/useEditContractStatus'
import useFormModal from '@ui/shared/modal/form-modal/useFormModal'
import { useRef, useState } from 'react'
import ContractResolutionDateForm from '../feature-contract-form/ContractResolutionDateForm'
import { useDrag } from 'react-dnd'

const contractInProgressGroup: ContractStatus[] = [
  ContractStatus.carInspection,
  ContractStatus.priceNegotiation,
  ContractStatus.contractDraft,
]

const contractOutcomeGroup: ContractStatus[] = [
  ContractStatus.contractSuccessful,
  ContractStatus.contractFailed,
]

const useContractDrag = (data: ContractType, status: ContractStatus) => {
  const { mutateAsync: editContractStatusAsync } = useEditContractStatus()
  const { openFormModal, closeFormModal } = useFormModal()
  const [isLoading, setIsLoading] = useState(false)
  const dragRef = useRef<HTMLDivElement | null>(null)

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'CARD',

    // ✅ 이미 완료된(contractSuccessful, contractFailed) 계약은 드래그 불가
    canDrag: !contractOutcomeGroup.includes(status),

    item: { id: data.id },

    end: async (item, monitor) => {
      const dropResult = monitor.getDropResult<{ name: ContractStatus }>()
      if (!item || !dropResult) return
      if (dropResult.name === status) return

      setIsLoading(true)
      try {
        const prevStatus = status
        const newStatus = dropResult.name

        // 진행 중 → 진행 중
        if (contractInProgressGroup.includes(prevStatus) && contractInProgressGroup.includes(newStatus)) {
          await editContractStatusAsync({ id: item.id, data: { status: newStatus }, prevStatus })

        // 진행 중 → 완료(성공/실패)
        } else if (contractInProgressGroup.includes(prevStatus) && contractOutcomeGroup.includes(newStatus)) {
          openFormModal({
            title: `계약 ${newStatus === ContractStatus.contractSuccessful ? '성공' : '실패'} 등록`,
            form: (
              <ContractResolutionDateForm
                onCancel={closeFormModal}
                onSubmit={async (formData) => {
                  closeFormModal()
                  const { resolutionDate } = formData
                  await editContractStatusAsync({
                    id: item.id,
                    data: { status: newStatus, resolutionDate },
                    prevStatus,
                  })
                }}
                type={newStatus}
              />
            ),
          })

        // 완료 → 진행 중 (원래는 막히지만, 여기서도 그냥 return 처리 가능)
        } else if (contractOutcomeGroup.includes(prevStatus) && contractInProgressGroup.includes(newStatus)) {
          return

        // 완료 → 완료 (변경 없음)
        } else if (contractOutcomeGroup.includes(prevStatus) && contractOutcomeGroup.includes(newStatus)) {
          return
        }
      } finally {
        setIsLoading(false)
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  drag(dragRef)

  return { dragRef, isDragging, isLoading }
}

export default useContractDrag
