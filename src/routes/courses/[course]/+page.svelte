<script>
	import { onMount } from 'svelte';

	let course = {
		programData: {
			programTitle: 'Aeronautical Engineering',
			degreeAward: 'MEng (Hons) + DIS / DPS / DIntS (See programme outline for further detail)',
			length: '4 Years or 5 Years including a placement year',
			department:
				'School of Aeronautical, Automotive, Chemical and Materials Engineering / Aeronautical and Automotive Engineering',
			campus: 'Loughborough',
			degreeCode: 'TTUM01',
			ucasCode: 'H402, H403'
		}
	};

	onMount(() => {
		// You can fetch course data here if needed
	});
</script>

<svelte:head>
	<title>{course.programData.programTitle} - University Course</title>
</svelte:head>

<div class="container grid grid-cols-7 pt-8 gap-6">
  <div class='col-span-5'>
    <div class="flex flex-col justify-center h-full">
      <div>
        <h1 class="text-4xl font-semibold">MEng {course.programData.programTitle}</h1>
        <h2 class="text-2xl font-medium text-gray-800">
          Loughborough University <span class="text-gray-400">- {course.programData.department}</span>
        </h2>
        <div class="my-1 flex gap-x-1">
          <h4 class="rounded-full bg-gray-100 px-2 py-0.5 font-medium">
            UCAS Institution Code: L79
          </h4>
          <h4 class="rounded-full bg-gray-100 px-2 py-0.5 font-medium">
            UCAS Code: {course.programData.ucasCode}
          </h4>
          <h4 class="rounded-full bg-gray-100 px-2 py-0.5 font-medium">
            Internal Code: {course.programData.degreeCode}
          </h4>
        </div>
      </div>
    </div>
  </div>

  <div class='card col-span-2'>
    <!-- <h2 class="mb-4 text-center text-2xl font-semibold">Fees</h2> -->
    <table class='w-full'>
      <tr class='bg-gray-100'>
        <th class='p-2 text-left'>Status</th>
        <th class='p-2 text-center'>Fees Per Year</th>
      </tr>
      <tr>
        <td class='p-2 text-left'>Home</td>
        <td class='p-2 text-center'>£9,250</td>
      </tr>
      <tr class='bg-gray-100'>
        <td class='p-2 text-left'>International</td>
        <td class='p-2 text-center'>£27,000</td>
      </tr>
    </table>
  </div>

  <div class="card col-span-2">
    <h2 class="mb-4 text-center text-2xl font-semibold">Length</h2>
    <h3 class="text-center text-xl">4 years with optional placement year</h3>
  </div>
  <div class="card col-span-2">
    <h2 class="mb-4 text-center text-2xl font-semibold">Credits</h2>
    <h3 class="text-center text-xl">480 UK, 240 ECTS</h3>
  </div>
  <div class="card col-span-3">
    <h2 class="mb-4 text-2xl font-semibold text-center">Accredited by</h2>
    <ul>
      <li>Royal Aeronautical Society (RAeS)</li>
      <li>Institution of Mechanical Engineers (IMechE)</li>
    </ul>
  </div>

  <div class="card col-span-3">
    <h2 class="mb-4 text-2xl font-semibold">Entry Requirements</h2>
    <table class="w-full">
      <thead>
        <tr class="bg-gray-100">
          <th class="p-2 text-left">System</th>
          <th class="p-2 text-left">Score</th>
          <th class="p-2 text-left">Additional Requirements</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="p-2">UK (A-Levels)</td>
          <td class="p-2">AAA</td>
          <td class="p-2">Maths and Physics required</td>
        </tr>
        <tr class="bg-gray-50">
          <td class="p-2">International Baccalaureate (IB)</td>
          <td class="p-2">37</td>
          <td class="p-2">HL Maths and Physics required</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="card col-span-2">
    <h2 class="mb-4 text-2xl font-semibold">Assessment Methods</h2>
    <table class="w-full">
      <thead>
        <tr class="bg-gray-100">
          <th class="p-2 text-left">Method</th>
          <th class="p-2 text-left text-center">Weight</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="p-2">Exam</td>
          <td class="p-2 text-center">80%</td>
        </tr>
        <tr class="bg-gray-50">
          <td class="p-2">Coursework</td>
          <td class="p-2 text-center">10%</td>
        </tr>
        <tr>
          <td class="p-2">Project</td>
          <td class="p-2 text-center">10%</td>
        </tr>
      </tbody>
    </table>
    <p class='text-neutral-400 font-medium'>* Only shows distribution in compulsary modules</p>
  </div>
  <div class="card col-span-2">
    <h2 class="mb-4 text-2xl font-semibold">Content Split</h2>
    <table class="w-full">
      <thead>
        <tr class="bg-gray-100">
          <th class="p-2 text-left">Type</th>
          <th class="p-2 text-left">Weight</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="p-2">Compulsary</td>
          <td class="p-2 text-center">70%</td>
        </tr>
        <tr class="bg-gray-50">
          <td class="p-2">Optional (departmental)</td>
          <td class="p-2 text-center">10%</td>
        </tr>
        <tr>
          <td class="p-2">Optional (interdepertment)</td>
          <td class="p-2 text-center">10%</td>
        </tr>
        <!-- <tr class="bg-gray-50">
          <td class="p-2">Language</td>
          <td class="p-2">10%</td>
        </tr> -->
      </tbody>
    </table>
  </div>

	<div class="card col-span-4">
		<h2 class="mb-4 text-2xl font-semibold">Course Summary</h2>
		<p class="text-gray-700">
			This MEng Aeronautical Engineering program offers a comprehensive study of aeronautical
			principles and practices. Students will gain expertise in aircraft design, aerodynamics,
			propulsion systems, and materials science. The course includes a mix of theoretical knowledge
			and practical applications, preparing graduates for careers in the aerospace industry and
			related fields. With options for a placement year, this program provides a well-rounded
			education in aeronautical engineering.
		</p>
	</div>

  <div class='card col-span-3'>
    <h2 class="mb-4 text-2xl font-semibold">Content areas</h2>
    <div class='flex flex-wrap gap-2'>
      <h3 class='pill'>Fluid Dynamics</h3>
      <h3 class='pill'>MATLAB</h3>
      <h3 class='pill'>Aerospace Dynamics</h3>
      <h3 class='pill'>Sensor Fusion</h3>
      <h3 class='pill'>Unmanned Aerial Vehicles</h3>
      <h3 class='pill'>Industrial Projects</h3>
      <h3 class='pill'>Control Engineering</h3>
      <h3 class='pill'>Avionics</h3>
      <h3 class='pill'>Materials Science</h3>
      <h3 class='pill'>Mechanics</h3>
    </div>
  </div>

	<div class="card col-span-7">
		<h2 class="mb-4 text-2xl font-semibold">Programme Structure</h2>
		<p class="mb-4 text-gray-700">
			The programme is structured over four years (with an optional placement year). Each year
			consists of modules that build upon previous knowledge, gradually increasing in complexity and
			specialization. Students will have the opportunity to choose optional modules in later years,
			allowing for customization of their degree path.
		</p>
		<a href="/degrees/1" class="btn btn-primary">View Full Course Structure</a>
	</div>
  <!-- <div class="card col-span-2">
    <h2 class="mb-4 text-center text-2xl font-semibold">Grade Boundaries</h2>
    <table class="w-full">
      <tr class="bg-gray-100">
        <th class="p-2 text-left">UK</th>
        <th class="p-2 text-left">US</th>
        <th class="p-2 text-left">Percentage</th>
      </tr>
      <tr>
        <td class="p-2">1st</td>
        <td class="p-2">?</td>
        <td class="p-2">+70%</td>
      </tr>
      <tr class="bg-gray-50">
        <td class="p-2">2:1</td>
        <td class="p-2">?</td>
        <td class="p-2">59.5% - 69.5%</td>
      </tr>
      <tr>
        <td class="p-2">2:2</td>
        <td class="p-2">?</td>
        <td class="p-2">49.5% - 59.5%</td>
      </tr>
      <tr class="bg-gray-50">
        <td class="p-2">3rd (Pass)</td>
        <td class="p-2">?</td>
        <td class="p-2">39.5% - 49.5%</td>
      </tr>
    </table>
  </div> -->
</div>


<style>
  .pill {
    @apply bg-neutral-200 rounded-full px-2 py-0.5;
  }
</style>