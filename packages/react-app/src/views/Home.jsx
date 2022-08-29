import React, { useEffect, useState } from "react";
import { useContractReader } from "eth-hooks";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import { BanknotesIcon } from '@heroicons/react/20/solid'
import { Blockie } from "../components";
import { shortenAddress } from "../helpers";

import VAULTABI from '../contracts/ABI/EndaomentVault.json'

export default function Home({readContracts, localProvider}) {

  const vaultCount = useContractReader(readContracts, "EndaomentFactory", "vaultCount");
  const [vaults, setVaults] = useState([]);

  useEffect(() => {
    if (!vaultCount) {
      return;
    }
    const limit = 3;
    const maxVault = vaultCount > limit ? limit : vaultCount;
    (async () => {
      let v = [];
      for (let x=0;x<vaultCount;x++) {
        const address = await readContracts.EndaomentFactory.vaultIndex(x);
        const vault = new ethers.Contract(address, VAULTABI, localProvider);
        const name = await vault.name();
        v.push({ address, name });
      }
      setVaults(v);
    })();
  }, [vaultCount]);

  return (
    <div>
      <section className="container mx-auto px-6 p-10">

        <div className="flex items-center flex-wrap mb-20">
          <div className="w-full md:w-1/2">
            <h4 className="text-3xl text-gray-800 font-bold mb-3">Title</h4>
            <p className="text-gray-600 mb-8">
              Direct funds toward causes you care about with Beefy vault interest. Withdraw your full principal at any time. Complete with deployer to enable anyone to create a custom funding stream. A new DeFi primitive built on top of Beefy vaults.
            </p>
          </div>
          <div className="w-full md:w-1/2">
            <img className="rounded-md" src="/Social_Grazing_wide.png" width="480"/>
          </div>
        </div>

        <div className="bg-gray-50 pt-8 sm:pt-16">
          <div className="mt-4 pb-12 bg-white sm:pb-16">
            <div className="relative">
              <div className="absolute inset-0 h-1/2 bg-gray-50" />
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                  <dl className="rounded-lg bg-white shadow-lg sm:grid sm:grid-cols-3">
                    <div className="flex flex-col border-b border-gray-100 p-6 text-center sm:border-0 sm:border-r">
                      <dt className="order-2 mt-2 text-lg leading-6 font-medium text-gray-500">Vaults Deployed</dt>
                      <dd className="order-1 text-5xl tracking-tight font-bold text-emerald-600">{ vaultCount ? vaultCount.toNumber() : '...' }</dd>
                    </div>
                    <div className="flex flex-col border-t border-b border-gray-100 p-6 text-center sm:border-0 sm:border-l sm:border-r">
                      <dt className="order-2 mt-2 text-lg leading-6 font-medium text-gray-500">Princial Staked</dt>
                      <dd className="order-1 text-5xl tracking-tight font-bold text-emerald-600">x,xxx</dd>
                    </div>
                    <div className="flex flex-col border-t border-gray-100 p-6 text-center sm:border-0 sm:border-l">
                      <dt className="order-2 mt-2 text-lg leading-6 font-medium text-gray-500">Interest Earned</dt>
                      <dd className="order-1 text-5xl tracking-tight font-bold text-emerald-600">y,yyy</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
         <h4 className="text-3xl text-gray-800 font-bold mt-12 mb-6">Featured Vaults</h4>
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

        </div>

      </section>

    </div>

  );
}
