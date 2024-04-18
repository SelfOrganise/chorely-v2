'use client';

import { useRouter } from 'next/navigation';

export default function Loading() {
  return (
    <div className="w-full">
      <div className="divider">Actions</div>
      <div className="grid grid-cols-2 gap-2">
        <button disabled={true} className="skeleton btn-secondary btn flex flex-1">
          Archive
        </button>
        <button disabled={true} className="skeleton btn-error btn flex flex-1">
          Delete
        </button>
      </div>

      <div className="divider">Edit task</div>

      <form className="relative flex flex-col space-y-3 pb-4">
        <div className="indicator w-full">
          <input
            disabled={true}
            className=" skeleton input-bordered input w-full"
            type="text"
            name="title"
            placeholder="Title"
          />
        </div>
        <input
          disabled={true}
          className="skeleton input-bordered input"
          type="number"
          name="frequency"
          placeholder="Frequency in hours"
        />
        <div className="grid grid-cols-2 gap-2">
          <button disabled={true} className="skeleton btn-secondary btn flex flex-1">
            Back
          </button>
          <button disabled={true} className="skeleton btn-primary btn flex flex-1" type="submit">
            Save
          </button>
        </div>
      </form>

      <div className="divider">History</div>

      <div className="w-full">
        <table className="table-zebra table-compact table w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th className="text-center">Date</th>
              <th className="w-2 text-center">Undo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className="skeleton w-full h-4"></div>
              </td>
              <td>
                <div className="skeleton w-full h-4"></div>
              </td>
              <td>
                <div className="skeleton w-full h-4"></div>
              </td>
            </tr>
            <tr>
              <td>
                <div className="skeleton w-full h-4"></div>
              </td>
              <td>
                <div className="skeleton w-full h-4"></div>
              </td>
              <td>
                <div className="skeleton w-full h-4"></div>
              </td>
            </tr>
            <tr>
              <td>
                <div className="skeleton w-full h-4"></div>
              </td>
              <td>
                <div className="skeleton w-full h-4"></div>
              </td>
              <td>
                <div className="skeleton w-full h-4"></div>
              </td>
            </tr>
            <tr>
              <td>
                <div className="skeleton w-full h-4"></div>
              </td>
              <td>
                <div className="skeleton w-full h-4"></div>
              </td>
              <td>
                <div className="skeleton w-full h-4"></div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
