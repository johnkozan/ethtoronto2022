import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import { useContractReader } from "eth-hooks";
import { ArrowLongLeftIcon, ArrowLongRightIcon, BanknotesIcon } from "@heroicons/react/20/solid"

import { Blockie } from "../components";
import { shortenAddress } from "../helpers";

import VAULTABI from "../contracts/ABI/EndaomentVault.json"

export default function Browse({readContracts, localProvider}) {
  const vaultCount = useContractReader(readContracts, "EndaomentFactory", "vaultCount");
  const [vaults, setVaults] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!vaultCount) {
      return;
    }
    (async () => {
      let v = [];
      for (let x=0;x<vaultCount;x++) {
        const address = await readContracts.EndaomentFactory.vaultIndex(x);
        const vault = new ethers.Contract(address, VAULTABI, localProvider);
        const name = await vault.name();
        v.push({ address, name });
      }
      setVaults(v);
      setLoaded(true);
    })();
  }, [vaultCount]);

  if (!loaded) {

    return (
      <div>Loading...</div>
    );
  }

  return (
    <div className="bg-white px-4 py-5 border-b border-gray-200 sm:px-6">
      <h3 className="text-lg leading-6 font-medium text-gray-900">Browse Vaults</h3>

      <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {vaults.map((vault) => (
          <li
            key={vault.address}
            className="col-span-1 flex flex-col text-center bg-white rounded-lg shadow divide-y divide-gray-200"
          >
            <div className="flex-1 flex flex-col p-8">
              <Blockie size={12} className="w-32 h-32 flex-shrink-0 mx-auto rounded-full" address={vault.address} alt={vault.address} />
              <h3 className="mt-6 text-gray-900 text-sm font-medium"><Link to={`/${vault.address}`}>{vault.name}</Link></h3>
              <dl className="mt-1 flex-grow flex flex-col justify-between">
                <dt className="sr-only">Address</dt>
                <dd className="text-gray-500 text-sm">{shortenAddress(vault.address)}</dd>
              </dl>
            </div>
            <div>
              <div className="-mt-px flex divide-x divide-gray-200">
                <div className="w-0 flex-1 flex">
                  <Link
                    to={`/${vault.address}`}
                    className="relative -mr-px w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-bl-lg hover:text-gray-500"
                  >
                    <BanknotesIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
                    <span className="ml-3">Stake</span>
                  </Link>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

          <nav className="border-t border-gray-200 px-4 flex items-center justify-between sm:px-0">
      <div className="-mt-px w-0 flex-1 flex">
        <a
          href="#"
          className="border-t-2 border-transparent pt-4 pr-1 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
        >
          <ArrowLongLeftIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
          Previous
        </a>
      </div>
      <div className="hidden md:-mt-px md:flex">
        <a
          href="#"
          className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 border-t-2 pt-4 px-4 inline-flex items-center text-sm font-medium"
        >
          1
        </a>
        {/* Current: "border-indigo-500 text-indigo-600", Default: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300" */}
        <a
          href="#"
          className="border-indigo-500 text-indigo-600 border-t-2 pt-4 px-4 inline-flex items-center text-sm font-medium"
          aria-current="page"
        >
          2
        </a>
        <a
          href="#"
          className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 border-t-2 pt-4 px-4 inline-flex items-center text-sm font-medium"
        >
          3
        </a>
        <span className="border-transparent text-gray-500 border-t-2 pt-4 px-4 inline-flex items-center text-sm font-medium">
          ...
        </span>
        <a
          href="#"
          className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 border-t-2 pt-4 px-4 inline-flex items-center text-sm font-medium"
        >
          8
        </a>
        <a
          href="#"
          className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 border-t-2 pt-4 px-4 inline-flex items-center text-sm font-medium"
        >
          9
        </a>
        <a
          href="#"
          className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 border-t-2 pt-4 px-4 inline-flex items-center text-sm font-medium"
        >
          10
        </a>
      </div>
      <div className="-mt-px w-0 flex-1 flex justify-end">
        <a
          href="#"
          className="border-t-2 border-transparent pt-4 pl-1 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
        >
          Next
          <ArrowLongRightIcon className="ml-3 h-5 w-5 text-gray-400" aria-hidden="true" />
        </a>
      </div>
    </nav>

    </div>
  );

}
