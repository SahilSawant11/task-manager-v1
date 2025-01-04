import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
type FilterProps = {
  onFilterChange: (filters: FilterState) => void
  categories: string[]
  teamLeads: string[]
  projects: string[]
}

type FilterState = {
  search: string
  status: string
  priority: string
  category: string
  teamLead: string
  project: string
  fromDate: string
  toDate: string
}

export function IssueFilter({ onFilterChange, categories, teamLeads, projects }: FilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    priority: 'all',
    category: 'all',
    teamLead: 'all',
    project: 'all',
    fromDate: '',
    toDate: '',
  })

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Input
        placeholder="Search issues..."
        value={filters.search}
        onChange={(e) => handleFilterChange('search', e.target.value)}
        className="w-full md:w-auto"
      />
      <Select onValueChange={(value) => handleFilterChange('status', value)}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="open">Open</SelectItem>
          <SelectItem value="in progress">In Progress</SelectItem>
          <SelectItem value="closed">Closed</SelectItem>
        </SelectContent>
      </Select>
      <Select onValueChange={(value) => handleFilterChange('priority', value)}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
        </SelectContent>
      </Select>
      <Select onValueChange={(value) => handleFilterChange('category', value)}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select onValueChange={(value) => handleFilterChange('teamLead', value)}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Team Lead" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {teamLeads.map((teamLead) => (
            <SelectItem key={teamLead} value={teamLead}>
              {teamLead}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select onValueChange={(value) => handleFilterChange('project', value)}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Project" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {projects.map((project) => (
            <SelectItem key={project} value={project}>
              {project}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="date"
        value={filters.fromDate}
        onChange={(e) => handleFilterChange('fromDate', e.target.value)}
        className="w-auto"
      />
      <Input
        type="date"
        value={filters.toDate}
        onChange={(e) => handleFilterChange('toDate', e.target.value)}
        className="w-auto"
      />
    </div>
  )
}

