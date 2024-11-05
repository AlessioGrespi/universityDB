<script>
	// Example course data
	let courses = [
		{
			url: './courses/robotics',
			code: 'WSUB35',
			award: 'BEng',
			title: 'Robotics, Mechatronics and Control Engineering',
			department: 'Wolfson School of Mechanical, Electrical and Manufacturing Engineering',
			examWeighting: '80%',
			courseworkWeighting: '10%',
			projectWeighting: '10%',
			homeFees: '£9,250',
			internationalFees: '£27,000'
		}
		// Add more course data as needed
	];
</script>

<div class="card mt-4 px-1 py-4">
	<h1>Courses</h1>
	<div class="flex w-full flex-col gap-2">
        <a href='/courses/robotics'>
		<div class="subcard flex justify-between place-items-center">
			<div class="index">
                <div class='flex gap-1 flex-wrap place-items-center'>
                    <h3 class=''>Loughborough University</h3>
                    <h3 class='text-gray-500'>Wolfson School of Mechanical, Electrical and Manufacturing Engineering</h3>
                </div>
				<h2 class='text-nowrap'>BEng Robotics, Mechatronics and Control Engineering</h2>
				<div class="flex gap-1">
                    <h4 class="">#WSUB35</h4>
                    <h4 class=''>UCAS Institution Code: L79</h4>
					<h4 class="">UCAS Code: H402, H403</h4>
				</div>
			</div>
            <div class='index flex flex-col gap-1 max-w-[40%]'>
                <div class='flex flex-wrap text-nowrap place-items-center justify-end w-full gap-1'>
                    <h4 class=''>Entry Requirements: ABB</h4>
                    <h4>25 Places</h4>
                </div>
                <div class='flex flex-wrap text-nowrap place-items-center justify-end w-full gap-1'>
                    <h4>Placement Year</h4>
                    <h4>Study Abroad</h4>
                </div>
                <div class='flex place-items-center justify-end w-full gap-1'>
                    <h3 class='text-sm'>Fees Per Year: </h3>
                    <h4 class=''>Home £9,250</h4>
                    <h4 class=''>International £27,000</h4>
                </div>
                <div class='flex place-items-center justify-end w-full gap-1'>
                    <h3 class='text-sm'>Assessment: </h3>
                    <h4 class=''>Exam 80%</h4>
                    <h4 class=''>Coursework 10%</h4>
                    <h4 class=''>Project 10%</h4>
                </div>
            </div>
        </a>
        <a href='courses/robotics'>
        <div class="subcard flex justify-between place-items-center">
			<div class="index">
                <div class='flex gap-1 flex-wrap place-items-center'>
                    <h3 class=''>Loughborough University</h3>
                    <h3 class='text-gray-500'>School of Design and Creative Arts / Design</h3>
                </div>
				<h2 class='text-nowrap'>MSc User Experience Design</h2>
				<div class="flex gap-1">
                    <h4 class="">#DSPT27</h4>
                    <!-- <h4 class=''>UCAS Institution Code: L79</h4> -->
					<!-- <h4 class="">UCAS Code: H402, H403</h4> -->
				</div>
			</div>
            <div class='index flex flex-col gap-1 max-w-[40%]'>
                <div class='flex flex-wrap text-nowrap place-items-center justify-end w-full gap-1'>
                    <h4 class=''>Entry Requirements: 2:1</h4>
                    <h4>25 Places</h4>
                </div>
                <!-- <div class='flex flex-wrap text-nowrap place-items-center justify-end w-full gap-1'>
                    <h4>Placement Year</h4>
                    <h4>Study Abroad</h4>
                </div> -->
                <div class='flex place-items-center justify-end w-full gap-1'>
                    <h3 class='text-sm'>Fees Per Year: </h3>
                    <h4 class=''>Home £11,000</h4>
                    <h4 class=''>International £29,000</h4>
                </div>
                <div class='flex place-items-center justify-end w-full gap-1'>
                    <h3 class='text-sm'>Assessment: </h3>
                    <!-- <h4 class=''>Exam 80%</h4> -->
                    <h4 class=''>Coursework 60%</h4>
                    <h4 class=''>Project 40%</h4>
                </div>
            </div>
        </a>
		</div>
	</div>
	<!-- <table class="page-table">
		<thead>
			<tr>
				<th class="px-0.5 sm:px-2" rowspan="2"><span class="hidden sm:inline">Course </span>Code</th
				>
				<th class="px-0.5 sm:px-2" rowspan="2">Award</th>
				<th rowspan="2">Title</th>
				<th class="hidden sm:table-cell" rowspan="2"
					><span class="hidden sm:inline">Department</span><span class="inline sm:hidden">Dept</span
					></th
				>
				<th colspan="3">Assessment Weighting</th>
				<th colspan="2">Fees</th>
			</tr>
			<tr>
				<th class="px-0.5 sm:px-2">Exam</th>
				<th class="px-0.5 sm:px-2"
					><span class="hidden sm:inline">Coursework</span><span class="inline sm:hidden">CW</span
					></th
				>
				<th class="px-0.5 sm:px-2">Project</th>
				<th class="px-0.5 sm:px-2">Home</th>
				<th class="px-0.5 sm:px-2">International</th>
			</tr>
		</thead>
		<tbody>
			{#each courses as course}
				<tr>
					<td>
						<a href={course.url} class="block">{course.code}</a>
					</td>
					<td>
						<a href={course.url} class="block">{course.award}</a>
					</td>
					<td class="text-left">
						<a href={course.url} class="block">{course.title}</a>
					</td>
					<td class="hidden text-left sm:inline">
						<a href={course.url} class="block">{course.department}</a>
					</td>
					<td>
						<a href={course.url} class="block">{course.examWeighting}</a>
					</td>
					<td>
						<a href={course.url} class="block">{course.courseworkWeighting}</a>
					</td>
					<td>
						<a href={course.url} class="block">{course.projectWeighting}</a>
					</td>
					<td>
						<a href={course.url} class="block">{course.homeFees}</a>
					</td>
					<td>
						<a href={course.url} class="block">{course.internationalFees}</a>
					</td>
				</tr>
			{/each}
		</tbody>
	</table> -->


<style>
	/* table {
        @apply w-full table-auto mt-2;
    } */
	th {
		@apply bg-neutral-100 py-2 text-xs font-medium sm:text-base;
	}
	tr {
		@apply text-center hover:bg-neutral-50;
	}
	td {
		@apply px-0.5 text-xs sm:px-2 sm:text-base;
	}
	/* border-collapse border border-slate-500 */
</style>
