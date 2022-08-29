import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { RadioGroup } from '@headlessui/react'
import { AddressInput } from "../components";
import { classNames } from "../helpers"
const { ethers } = require("ethers");

function Deployer({ yourLocalBalance, readContracts, address, tx, writeContracts, localProvider }) {
  const history = useHistory();

  const [beneficiary, setBeneficiary] = useState();
  const [name, setName] = useState('');

  useEffect(() => {
    if (address) { setBeneficiary(address); }
  }, [address]);

  const deployVault = async (e) => {
    e.preventDefault();
    console.log(beneficiary);
    console.log(name);

    tx(writeContracts.EndaomentFactory.deploy(beneficiary, name), (result, receipt) => {
      if (result.status === 1) {
        const newVaultAddress = `0x${result.logs[1].topics[1].substr(-40)}`;
        history.push(`/${newVaultAddress}`);
      }
    });
  };

  const formValid = !!name && name.length > 0 && ethers.utils.isAddress(beneficiary);

  if (!address) {
    return (
      <div>
        <div style={{ border: "1px solid #cccccc", padding: 16, width: 600, margin: "auto", marginTop: 64 }}>
          Connect your wallet to deploy a vault
        </div>
      </div>
    );
  }

  return (
    <>
      <div>
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Deploy a New Vault</h3>
              <p className="mt-1 text-sm text-gray-600">
                Contributors will be able to deposit into this vault.  The beneficiary can withdraw interest earned.
              </p>
            </div>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <form>
              <div className="shadow sm:rounded-md sm:overflow-hidden">
                <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-3 sm:col-span-2">
                      <label htmlFor="company-website" className="block text-sm font-medium text-gray-700">
                        Vault Name
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">

                        <input
                          type="text"
                          name="name"
                          id="name"
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="Vault name"
                          onChange={e => setName(e.target.value)}
                        />

                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="beneficiary" className="block text-sm font-medium text-gray-700">
                      Beneficiary
                    </label>
                    <div className="mt-1">
                      <AddressInput name="beneficiary" value={beneficiary} onChange={setBeneficiary} />
                    </div>
                  </div>


                  <div>
                    <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                      Currency
                    </label>

                    <RadioGroup name="currency" value="DAI" className="mt-2">
                      <RadioGroup.Label className="sr-only">Choose a memory option</RadioGroup.Label>
                      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                        <RadioGroup.Option
                          value="DAI"
                          className={() =>
                              classNames(
                                true ? 'cursor-pointer focus:outline-none' : 'opacity-25 cursor-not-allowed',
                                true ? 'ring-2 ring-offset-2 ring-indigo-500' : '',
                                false
                                  ? 'bg-indigo-600 border-transparent text-white hover:bg-indigo-700'
                                  : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50',
                                'border rounded-md py-3 px-3 flex items-center justify-center text-sm font-medium uppercase sm:flex-1'
                              )
                          }
                          disabled={false}
                        >
                          <RadioGroup.Label as="span">
                            <img src="/dai.webp" />
                            DAI
                          </RadioGroup.Label>
                        </RadioGroup.Option>
                      </div>
                    </RadioGroup>
                  </div>



                </div>
                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                  <button
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={deployVault}
                  >
                    Deploy Vault
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="hidden sm:block" aria-hidden="true">
        <div className="py-5">
          <div className="border-t border-gray-200" />
        </div>
      </div>

    </>
  );
}

export default Deployer;
