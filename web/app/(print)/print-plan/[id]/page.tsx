import ErrorPage404 from 'lib/components/404/404'
import RideListPrint from 'lib/components/plan/print/RideListPrint'
import { getPlanById } from 'lib/data/plans'
import { formatDateLong } from 'lib/helpers/helpers'
import { ActiveJobNoPlan } from 'lib/types/active-job'
import Image from 'next/image'
import logoImage from 'public/logo-smj-yellow.png'
import React from 'react'
import '/styles/print.css'
import { ToolCompleteData } from 'lib/types/tool'
import { toolNameMapping } from 'lib/data/enumMapping/toolNameMapping'

type PathProps = {
  params: Promise<{
    id: string
  }>
}

function formatTools(tools: ToolCompleteData[]) {
  if (tools.length == 0) return 'Žádné'
  return tools
    .map(
      tool =>
        toolNameMapping[tool.tool] +
        (tool.amount > 1 ? ' - ' + tool.amount : '')
    )
    .join(', ')
}

export default async function PrintPlanPage(props: PathProps) {
  const params = await props.params;
  const plan = await getPlanById(params.id)
  if (!plan) return <ErrorPage404 message="Plán nenalezen." />
  const sortedJobs = plan.jobs.sort((a, b) =>
    a.proposedJob.name.localeCompare(b.proposedJob.name)
  )
  for (let i = 1; i <= sortedJobs.length; i++) {
    sortedJobs[i - 1].id = i.toString()
  }

  return (
    <>
      <div className="print-a4">
        <div className="header">
          <h1>{formatDateLong(plan.day)}</h1>
          <Image
            src={logoImage}
            className="smj-logo"
            alt="SummerJob logo"
            quality={98}
            priority={true}
          />
        </div>

        {sortedJobs.map(job => (
          <JobInfo job={job} jobs={sortedJobs} key={job.id}></JobInfo>
        ))}
      </div>
    </>
  )
}

function JobInfo({
  job,
  jobs,
}: {
  job: ActiveJobNoPlan
  jobs: ActiveJobNoPlan[]
}) {
  const otherJobs = jobs.filter(j => j.id !== job.id)
  return (
    <div className="jobinfo-container">
      <div className="job-number-col">{job.id}</div>
      <div className="job-data-col">
        <div className="w-50">
          <h2>{job.proposedJob.name}</h2>
          <p style={{ whiteSpace: 'pre-wrap' }}>
            {job.proposedJob.publicDescription}
          </p>
          <div className="mb-2" style={{ fontSize: '1.1em', fontWeight: 'bold', color: '#d63384' }}>
            <i className="fas fa-user-nurse me-1"></i>
            Zdravotník: 732 403 990
          </div>
          <div>
            <i className="fas fa-user-group me-1"></i>
            {job.workers.length == 0 && 'Nikdo'}
            {job.workers.length > 0 &&
              job.workers
                .map<React.ReactNode>(w =>
                  w.id === job.responsibleWorkerId ? (
                    <u key={`resp-worker-${w.id}`}>
                      {w.firstName} {w.lastName}
                    </u>
                  ) : (
                    <span key={`worker-${w.id}`}>
                      {w.firstName} {w.lastName}
                    </span>
                  )
                )
                .reduce((prev, curr) => [prev, ', ', curr])}
          </div>
          <div>
            <i className="fas fa-house me-1"></i>
            {job.proposedJob.address},{' '}
            {job.proposedJob.area?.name ?? 'Nezadaná oblast'}
          </div>
          <div>
            <i className="fas fa-phone me-1"></i>
            {job.proposedJob.contact}
          </div>

          <div>
            <i className="fas fa-screwdriver-wrench me-1"></i>
            {formatTools(job.proposedJob.toolsToTakeWith)}
          </div>
          <div>
            <i className="fas fa-utensils me-1"></i>
            {job.proposedJob.hasFood ? 'Ano' : 'Ne'}
            <span className="ms-4 me-4"></span>
            <i className="fas fa-shower me-1"></i>
            {job.proposedJob.hasShower ? 'Ano' : 'Ne'}
          </div>
        </div>

        <div className="w-50 mt-2">
          <RideListPrint job={job} otherJobs={otherJobs} />
        </div>
      </div>
    </div>
  )
}
